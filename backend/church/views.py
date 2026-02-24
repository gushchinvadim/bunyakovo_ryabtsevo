# backend/church/views.py
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q  # ← Добавляем правильный импорт Q
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Priest, ServiceSchedule, ChurchAnnouncement, ChurchMedia
from .serializers import PriestSerializer, ServiceScheduleSerializer, ChurchAnnouncementSerializer, \
    ChurchMediaSerializer


class PriestViewSet(viewsets.ReadOnlyModelViewSet):
    """API для священников"""

    queryset = Priest.objects.filter(is_active=True).order_by('order')
    serializer_class = PriestSerializer
    permission_classes = [permissions.AllowAny]



class ServiceScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    """API для расписания богослужений"""

    serializer_class = ServiceScheduleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Возвращаем только активные записи, сортируем по дате, затем по дню недели"""
        queryset = ServiceSchedule.objects.filter(is_active=True)
        # Сначала по дате (если есть), затем по дню недели, затем по времени
        queryset = queryset.order_by('date', 'day_of_week', 'order', 'time')
        return queryset

class ChurchAnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    """API для объявлений от батюшки"""

    serializer_class = ChurchAnnouncementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Возвращаем только активные и актуальные объявления"""
        from django.utils import timezone

        queryset = ChurchAnnouncement.objects.filter(is_active=True)

        # Фильтруем по актуальности
        now = timezone.now()
        queryset = queryset.filter(valid_from__lte=now)
        queryset = queryset.filter(
            Q(valid_until__isnull=True) |  # ← Исправлено: Q вместо models.Q
            Q(valid_until__gte=now)
        )

        return queryset.order_by('-priority', '-created_at')


class ChurchMediaViewSet(viewsets.ReadOnlyModelViewSet):
    """API для медиафайлов церкви"""

    serializer_class = ChurchMediaSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['media_type', 'event_date']
    ordering_fields = ['event_date', 'order', 'uploaded_at']
    ordering = ['-event_date', '-order']

    def get_queryset(self):
        """Возвращаем только опубликованные медиафайлы"""
        return ChurchMedia.objects.filter(is_published=True).order_by('-event_date', '-order')

    @action(detail=False, methods=['get'])
    def photos(self, request):
        """Только фотографии"""
        photos = self.get_queryset().filter(media_type='photo')
        serializer = self.get_serializer(photos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def videos(self, request):
        """Только видео"""
        videos = self.get_queryset().filter(media_type='video')
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)