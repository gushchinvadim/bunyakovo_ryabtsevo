# backend/marketplace/views.py
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q  # ← КЛЮЧЕВОЙ ИМПОРТ
from .models import Advertisement
from .serializers import AdvertisementSerializer, AdvertisementCreateSerializer
from django.core.mail import send_mail
from django.conf import settings
from .notifications import send_telegram_notification
from rest_framework.decorators import api_view


@api_view(['GET'])
def moderation_queue_count(request):
    """
    Возвращает количество объявлений, требующих модерации:
    - Новые объявления (pending)
    - Отклонённые объявления, ожидающие повторной модерации (rejected)
    """
    count = Advertisement.objects.filter(
        moderation_status__in=['pending', 'rejected']
    ).count()
    return Response({'count': count})

def notify_admin_about_moderation(self, advertisement, action_type):
    # gushchinvadim@gmail.com
    send_telegram_notification(advertisement, action_type)  # Добавить эту строку

class AdvertisementViewSet(viewsets.ModelViewSet):
    """Вьюсет для объявлений"""

    queryset = Advertisement.objects.filter(
        is_active=True,
        moderation_status='approved'  # Показываем только одобренные
    )
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ad_type', 'village', 'moderation_status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price', 'views']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Разные сериализаторы для разных действий"""
        if self.action in ['create', 'update', 'partial_update']:
            return AdvertisementCreateSerializer
        return AdvertisementSerializer


    def get_queryset(self):
        """Фильтрация: публика видит только одобренные, автор — свои"""
        if self.action in ['list', 'retrieve']:
            if not self.request.user.is_authenticated:
                # Гости видят только одобренные активные
                return Advertisement.objects.filter(
                    is_active=True,
                    moderation_status='approved'
                )
            # Авторизованные видят одобренные + свои (любой статус)
            return Advertisement.objects.filter(
                Q(moderation_status='approved', is_active=True) |
                Q(author=self.request.user)
            )
        # Для операций записи — только свои объявления
        return Advertisement.objects.filter(author=self.request.user)

    def get_permissions(self):
        """Настройка прав доступа для разных действий"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'deactivate']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Создание объявления → всегда на модерацию"""
        instance = serializer.save(author=self.request.user)
        instance.moderation_status = 'pending'  # ← Обязательно на модерацию
        instance.save()

    def perform_update(self, serializer):
        """Любое обновление → сброс на модерацию"""
        instance = serializer.save()
        instance.moderation_status = 'pending'  # ← Сбрасываем статус
        instance.moderation_comment = ''  # ← Очищаем комментарий
        instance.save()

    def retrieve(self, request, *args, **kwargs):
        """Увеличиваем счётчик просмотров при просмотре"""
        instance = self.get_object()

        # Увеличиваем просмотры только для одобренных объявлений
        if instance.moderation_status == 'approved':
            instance.views += 1
            instance.save()

        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def my_ads(self, request):
        """Получить объявления текущего пользователя (все статусы)"""
        ads = Advertisement.objects.filter(author=request.user)
        serializer = self.get_serializer(ads, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def deactivate(self, request, pk=None):
        """Деактивировать своё объявление"""
        try:
            # Получаем объявление
            ad = self.get_object()

            # Проверяем, что пользователь является автором
            if ad.author != request.user:
                return Response({
                    'error': 'Вы не можете деактивировать чужое объявление.'
                }, status=status.HTTP_403_FORBIDDEN)

            ad.is_active = False
            ad.save()

            return Response({
                'message': 'Объявление деактивировано.',
                'id': ad.id
            }, status=status.HTTP_200_OK)

        except Advertisement.DoesNotExist:
            return Response({
                'error': 'Объявление не найдено.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Ошибка деактивации: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Одобрить объявление (только админ)"""
        ad = self.get_object()
        ad.moderation_status = 'approved'
        ad.moderation_comment = ''
        ad.save()

        return Response({
            'message': 'Объявление одобрено.'
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Отклонить объявление (только админ)"""
        ad = self.get_object()

        comment = request.data.get('comment', '')
        if not comment:
            return Response({
                'error': 'Укажите причину отклонения.'
            }, status=status.HTTP_400_BAD_REQUEST)

        ad.moderation_status = 'rejected'
        ad.moderation_comment = comment
        ad.save()

        return Response({
            'message': 'Объявление отклонено.'
        })


    def destroy(self, request, *args, **kwargs):
        """Удалить объявление (только автор может удалить своё объявление)"""
        try:
            instance = self.get_object()

            # Проверяем, что пользователь является автором
            if instance.author != request.user:
                return Response({
                    'error': 'Вы не можете удалить чужое объявление.'
                }, status=status.HTTP_403_FORBIDDEN)

            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Advertisement.DoesNotExist:
            return Response({
                'error': 'Объявление не найдено.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Ошибка удаления: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def perform_update(self, serializer):
        """При ЛЮБОМ обновлении отправляем объявление на модерацию"""
        instance = serializer.save()

        # 🔑 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: ВСЕГДА сбрасываем статус на 'pending' после редактирования
        instance.moderation_status = 'pending'
        instance.moderation_comment = ''  # Очищаем комментарий модератора
        instance.is_active = True  # Объявление остаётся активным в системе, но скрыто от публики
        instance.save()

        # 🔔 Отправляем уведомление админу (см. Шаг 3)
        self.notify_admin_about_moderation(instance, 'updated')


    def notify_admin_about_moderation(self, advertisement, action_type):
        """Отправка уведомления админу о необходимости модерации"""
        try:
            subject = f"Новое объявление на модерацию ({action_type})" if action_type == 'created' else f"Объявление отредактировано — требуется повторная модерация"

            message = f"""
    Тип действия: {action_type}
    Объявление: {advertisement.title}
    Автор: {advertisement.author.username} ({advertisement.author.email})
    Тип: {advertisement.get_ad_type_display()}
    Населённый пункт: {advertisement.get_village_display()}
    Дата: {advertisement.created_at.strftime('%d.%m.%Y %H:%M')}

    Ссылка для модерации:
    http://localhost:8000/admin/marketplace/advertisement/{advertisement.id}/change/

    —
    Система модерации Буняково-Рябцево
            """.strip()

            # Получаем email админов из настроек
            admin_emails = [admin[1] for admin in settings.ADMINS] if hasattr(settings, 'ADMINS') else [
                'admin@example.com']

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=admin_emails,
                fail_silently=True,  # Не вызывать ошибку если письмо не отправилось
            )
        except Exception as e:
            # Логируем ошибку, но не прерываем работу
            print(f"Ошибка отправки уведомления: {e}")