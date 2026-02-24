# backend/church/serializers.py
from rest_framework import serializers
from .models import Priest, ServiceSchedule, ChurchAnnouncement, ChurchMedia


class PriestSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Priest
        fields = [
            'id', 'name', 'title', 'phone', 'email',
            'photo_url', 'biography', 'is_active', 'order'
        ]

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and hasattr(obj.photo, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

class ServiceScheduleSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    time_display = serializers.SerializerMethodField()
    date_display = serializers.SerializerMethodField()  # ← Новое поле

    class Meta:
        model = ServiceSchedule
        fields = [
            'id', 'day_of_week', 'day_of_week_display', 'date', 'date_display',
            'service_name', 'time', 'time_display',
            'description', 'is_active', 'order'
        ]

    def get_time_display(self, obj):
        return obj.time.strftime('%H:%M')

    def get_date_display(self, obj):
        if obj.date:
            return obj.date.strftime('%d.%m.%Y')
        return None


class ChurchAnnouncementSerializer(serializers.ModelSerializer):
    priest_name = serializers.CharField(source='priest.name', read_only=True)
    announcement_type_display = serializers.CharField(source='get_announcement_type_display', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = ChurchAnnouncement
        fields = [
            'id', 'title', 'content', 'announcement_type',
            'announcement_type_display', 'priest', 'priest_name',
            'is_active', 'priority', 'valid_from', 'valid_until',
            'is_valid', 'created_at', 'updated_at'
        ]


class ChurchMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    priest_name = serializers.CharField(source='priest.name', read_only=True)
    media_type_display = serializers.CharField(source='get_media_type_display', read_only=True)

    class Meta:
        model = ChurchMedia
        fields = [
            'id', 'title', 'description', 'media_type', 'media_type_display',
            'file', 'file_url', 'thumbnail', 'thumbnail_url',
            'event_date', 'priest', 'priest_name',
            'is_published', 'order', 'uploaded_at'
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
        return None