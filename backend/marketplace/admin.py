# backend/marketplace/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import Advertisement, AdvertisementImage


class AdvertisementImageInline(admin.TabularInline):
    model = AdvertisementImage
    extra = 3
    max_num = 3
    readonly_fields = ['uploaded_at']
    ordering = ['order']


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'ad_type', 'author', 'village', 'price',
        'moderation_status', 'is_active', 'views', 'created_at'
    ]
    list_filter = [
        'ad_type', 'village', 'moderation_status', 'is_active', 'created_at'
    ]
    search_fields = ['title', 'description', 'author__username', 'phone', 'email']
    readonly_fields = ['views', 'created_at', 'updated_at']
    inlines = [AdvertisementImageInline]

    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'ad_type', 'price')
        }),
        ('Контакты', {
            'fields': ('phone', 'email', 'address')
        }),
        ('Автор и местоположение', {
            'fields': ('author', 'village')
        }),
        ('Модерация', {
            'fields': ('moderation_status', 'moderation_comment')
        }),
        ('Статус', {
            'fields': ('is_active', 'views', 'created_at', 'updated_at')
        }),
    )

    actions = ['approve_ads', 'reject_ads']

    # ============ МАССОВЫЕ ДЕЙСТВИЯ ============

    def approve_ads(self, request, queryset):
        """Массовое одобрение"""
        pending = queryset.filter(moderation_status='pending')
        count = pending.update(moderation_status='approved', moderation_comment='')
        self.message_user(request, f'✅ Одобрено {count} объявлений.')

    approve_ads.short_description = '✅ Одобрить выбранные'

    def reject_ads(self, request, queryset):
        """Массовый отказ"""
        pending = queryset.filter(moderation_status='pending').count()
        if pending:
            self.message_user(request, f'⚠️ Для отклонения отредактируйте каждое объявление и укажите комментарий.',
                              'warning')
        else:
            self.message_user(request, 'ℹ️ Нет объявлений на модерации для отклонения.')

    reject_ads.short_description = '❌ Отклонить (с комментарием)'

    def ad_type_display(self, obj):
        display_values = {
            'sale': '🏷️ Продам',
            'buy': '💰 Куплю',
            'rent': '🏠 Сдам',
            'free': '🎁 Отдам',
            'handmade': '🔨 Услуги мастера',  # ← Добавьте эту строку
        }
        return format_html(
            '<span style="padding:3px 10px; border-radius:12px; background:{}; color:white; font-weight:600;">{}</span>',
            '#6c757d',  # Цвет можно изменить для handmade
            display_values.get(obj.ad_type, obj.get_ad_type_display())
        )

    ad_type_display.short_description = 'Тип'

    # ============ СЧЁТЧИК МОДЕРАЦИИ ЧЕРЕЗ СООБЩЕНИЕ ============

    # def changelist_view(self, request, extra_context=None):
    #     """Показываем сообщение с счётчиком модерации"""
    #     pending_count = Advertisement.objects.filter(moderation_status='pending').count()
    #
    #     if pending_count > 0:
    #         if pending_count == 1:
    #             msg = f"⚠️ Требуется модерация: {pending_count} объявление ждёт проверки"
    #         elif pending_count < 5:
    #             msg = f"⚠️ Требуется модерация: {pending_count} объявления ждут проверки"
    #         else:
    #             msg = f"⚠️ Требуется модерация: {pending_count} объявлений ждут проверки"
    #
    #         self.message_user(request, msg, level='WARNING')
    #
    #     return super().changelist_view(request, extra_context=extra_context)