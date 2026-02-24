# backend/church/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Priest, ServiceSchedule, ChurchAnnouncement, ChurchMedia


@admin.register(Priest)
class PriestAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'phone_display', 'is_active_display', 'order', 'photo_thumbnail']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'title', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'photo_preview']

    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'title', 'phone', 'email', 'biography')
        }),
        ('Фотография', {
            'fields': ('photo', 'photo_preview')
        }),
        ('Статус', {
            'fields': ('is_active', 'order')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def phone_display(self, obj):
        return format_html('<a href="tel:{}">{}</a>', obj.phone, obj.phone)

    phone_display.short_description = 'Телефон'

    def is_active_display(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#28a745; font-weight:bold;">✓ Активен</span>')
        return mark_safe('<span style="color:#dc3545; font-weight:bold;">✗ Скрыт</span>')

    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'

    def photo_thumbnail(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:50px; height:50px; object-fit:cover; border-radius:50%;" />',
                obj.photo.url
            )
        return '—'

    photo_thumbnail.short_description = 'Фото'

    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="max-width:300px; height:auto; border-radius:8px;" />',
                obj.photo.url
            )
        return 'Нет фотографии'

    photo_preview.short_description = 'Предпросмотр фото'

@admin.register(ServiceSchedule)
class ServiceScheduleAdmin(admin.ModelAdmin):
    list_display = ['day_of_week_display', 'date_display', 'service_name', 'time_display', 'is_active_display', 'order']
    list_filter = ['day_of_week', 'date', 'is_active']
    search_fields = ['service_name', 'description']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Расписание', {
            'fields': ('day_of_week', 'date', 'service_name', 'time', 'description')
        }),
        ('Статус', {
            'fields': ('is_active', 'order')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def day_of_week_display(self, obj):
        badges = {
            'monday': ('Понедельник', '#6c757d'),
            'tuesday': ('Вторник', '#6c757d'),
            'wednesday': ('Среда', '#6c757d'),
            'thursday': ('Четверг', '#6c757d'),
            'friday': ('Пятница', '#6c757d'),
            'saturday': ('Суббота', '#007bff'),
            'sunday': ('Воскресенье', '#28a745'),
            'holiday': ('Праздник', '#ffc107'),
        }
        text, color = badges.get(obj.day_of_week, (obj.get_day_of_week_display(), '#6c757d'))
        return format_html(
            '<span style="padding:3px 10px; border-radius:12px; background:{}; color:white; font-weight:600;">{}</span>',
            color, text
        )

    day_of_week_display.short_description = 'День недели'
    day_of_week_display.admin_order_field = 'day_of_week'

    def date_display(self, obj):
        if obj.date:
            return obj.date.strftime('%d.%m.%Y')
        return '—'

    date_display.short_description = 'Дата'
    date_display.admin_order_field = 'date'

    def time_display(self, obj):
        return obj.time.strftime('%H:%M')

    time_display.short_description = 'Время'

    def is_active_display(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#28a745; font-weight:bold;">✓ Активно</span>')
        return mark_safe('<span style="color:#dc3545; font-weight:bold;">✗ Скрыто</span>')

    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'

@admin.register(ChurchAnnouncement)
class ChurchAnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'announcement_type_badge', 'priest', 'is_active_display', 'priority', 'valid_period',
                    'created_at']
    list_filter = ['announcement_type', 'is_active', 'valid_from', 'valid_until']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Объявление', {
            'fields': ('title', 'content', 'announcement_type', 'priest')
        }),
        ('Время действия', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Статус', {
            'fields': ('is_active', 'priority')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def announcement_type_badge(self, obj):
        badges = {
            'general': ('Общее', '#6c757d'),
            'service': ('Служба', '#007bff'),
            'event': ('Мероприятие', '#ffc107'),
            'prayer': ('Молитва', '#17a2b8'),
            'urgent': ('СРОЧНО', '#dc3545'),
        }
        text, color = badges.get(obj.announcement_type, (obj.get_announcement_type_display(), '#6c757d'))
        return format_html(
            '<span style="padding:3px 10px; border-radius:12px; background:{}; color:white; font-weight:600;">{}</span>',
            color, text
        )

    announcement_type_badge.short_description = 'Тип'
    announcement_type_badge.admin_order_field = 'announcement_type'

    def is_active_display(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#28a745; font-weight:bold;">✓ Активно</span>')
        return mark_safe('<span style="color:#dc3545; font-weight:bold;">✗ Скрыто</span>')

    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'

    def valid_period(self, obj):
        from_text = obj.valid_from.strftime('%d.%m.%Y %H:%M')
        if obj.valid_until:
            to_text = obj.valid_until.strftime('%d.%m.%Y %H:%M')
            return f"{from_text} - {to_text}"
        return f"С {from_text}"

    valid_period.short_description = 'Период действия'


@admin.register(ChurchMedia)
class ChurchMediaAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type_badge', 'event_date', 'is_published_display', 'order', 'uploaded_by',
                    'uploaded_at']
    list_filter = ['media_type', 'is_published', 'event_date', 'uploaded_at']
    search_fields = ['title', 'description']
    readonly_fields = ['uploaded_at', 'uploaded_by', 'file_preview']

    fieldsets = (
        ('Медиафайл', {
            'fields': ('title', 'description', 'media_type', 'file', 'file_preview')
        }),
        ('Событие', {
            'fields': ('event_date', 'priest')
        }),
        ('Статус', {
            'fields': ('is_published', 'order')
        }),
        ('Загрузка', {
            'fields': ('uploaded_by', 'uploaded_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['publish_media', 'unpublish_media']

    def media_type_badge(self, obj):
        badges = {
            'photo': ('📷 Фото', '#007bff'),
            'video': ('🎥 Видео', '#28a745'),
        }
        text, color = badges.get(obj.media_type, (obj.get_media_type_display(), '#6c757d'))
        return format_html(
            '<span style="padding:3px 10px; border-radius:12px; background:{}; color:white; font-weight:600;">{}</span>',
            color, text
        )

    media_type_badge.short_description = 'Тип'
    media_type_badge.admin_order_field = 'media_type'

    def is_published_display(self, obj):
        if obj.is_published:
            return mark_safe('<span style="color:#28a745; font-weight:bold;">✓ Опубликовано</span>')
        return mark_safe('<span style="color:#ffc107; font-weight:bold;">⏳ На модерации</span>')

    is_published_display.short_description = 'Статус'
    is_published_display.admin_order_field = 'is_published'

    def file_preview(self, obj):
        if obj.media_type == 'photo' and obj.file:
            return format_html(
                '<img src="{}" style="max-width:400px; height:auto; border-radius:8px;" />',
                obj.file.url
            )
        elif obj.media_type == 'video' and obj.file:
            return format_html(
                '<video controls style="max-width:400px; border-radius:8px;" poster="{}">'
                '<source src="{}" type="video/mp4">'
                'Ваш браузер не поддерживает видео.'
                '</video>',
                obj.thumbnail.url if obj.thumbnail else '',
                obj.file.url
            )
        return 'Нет файла'

    file_preview.short_description = 'Предпросмотр'

    def publish_media(self, request, queryset):
        count = queryset.update(is_published=True)
        self.message_user(request, f'✅ Опубликовано {count} медиафайлов.')

    publish_media.short_description = '✅ Опубликовать выбранные'

    def unpublish_media(self, request, queryset):
        count = queryset.update(is_published=False)
        self.message_user(request, f'❌ Снято с публикации {count} медиафайлов.')

    unpublish_media.short_description = '❌ Скрыть выбранные'

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)