# backend/community/serializers.py
from rest_framework import serializers
from .models import NewsItem, CommunityMedia, UsefulPhone


class NewsItemSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = NewsItem
        fields = [
            'id', 'title', 'content', 'news_type',
            'is_active', 'priority', 'author_name',
            'created_at', 'updated_at', 'published_at'
        ]

class CommunityMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = CommunityMedia
        fields = [
            'id', 'title', 'description', 'media_type',
            'file', 'file_url', 'thumbnail', 'thumbnail_url',
            'order', 'is_published', 'uploaded_at', 'village'
        ]
        read_only_fields = ['file_url', 'thumbnail_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and hasattr(obj.thumbnail, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        # Для фото возвращаем URL файла как миниатюру
        if obj.media_type == 'photo' and obj.file:
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def validate_file(self, value):
        """Валидация размера файла"""
        max_sizes = {
            'photo': 5 * 1024 * 1024,  # 5 МБ
            'video': 100 * 1024 * 1024,  # 100 МБ
        }

        # Определяем тип из данных запроса
        media_type = self.initial_data.get('media_type', 'photo')
        max_size = max_sizes.get(media_type, 5 * 1024 * 1024)

        if value.size > max_size:
            raise serializers.ValidationError(
                f'Размер файла превышает лимит: {max_size // 1024 // 1024} МБ для {media_type}'
            )
        return value


# backend/community/serializers.py

class UsefulPhoneSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = UsefulPhone
        fields = [
            'id', 'name', 'phone', 'category', 'category_display',
            'description', 'is_active', 'order', 'created_at'
        ]