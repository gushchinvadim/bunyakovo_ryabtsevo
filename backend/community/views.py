
# backend/community/views.py
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import CommunityMedia, UsefulPhone
from .serializers import CommunityMediaSerializer, UsefulPhoneSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import NewsItem
from .serializers import NewsItemSerializer


class NewsItemViewSet(viewsets.ReadOnlyModelViewSet):
    """API для новостей и важной информации на главной странице"""

    serializer_class = NewsItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Возвращаем только активные записи"""
        return NewsItem.objects.filter(is_active=True).order_by('-priority', '-published_at')

    @action(detail=False, methods=['get'])
    def news(self, request):
        """Возвращает только новости (максимум 5 записи)"""
        news_items = NewsItem.objects.filter(
            is_active=True,
            news_type='news'
        ).order_by('-priority', '-published_at')[:5]

        serializer = self.get_serializer(news_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def important(self, request):
        """Возвращает только важную информацию (максимум 5 записи)"""
        important_items = NewsItem.objects.filter(
            is_active=True,
            news_type='important'
        ).order_by('-priority', '-published_at')[:5]

        serializer = self.get_serializer(important_items, many=True)
        return Response(serializer.data)


class CommunityMediaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API для медиа "О нас"
    Публичный доступ (только чтение)
    """
    queryset = CommunityMedia.objects.filter(is_published=True)
    serializer_class = CommunityMediaSerializer
    permission_classes = [permissions.AllowAny]  # Доступно всем
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['media_type', 'village']
    ordering_fields = ['order', 'uploaded_at']
    ordering = ['order', '-uploaded_at']
    search_fields = ['title', 'description']

    def get_queryset(self):
        """Опциональная фильтрация по деревне"""
        queryset = super().get_queryset()
        village = self.request.query_params.get('village', None)
        if village:
            queryset = queryset.filter(village=village)
        return queryset

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



class UsefulPhoneViewSet(viewsets.ReadOnlyModelViewSet):
    """API для полезных телефонов"""

    queryset = UsefulPhone.objects.filter(is_active=True).order_by('order', 'category')
    serializer_class = UsefulPhoneSerializer
    permission_classes = [permissions.AllowAny]