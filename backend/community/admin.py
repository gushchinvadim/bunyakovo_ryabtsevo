# backend/community/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe  # ← Добавляем импорт
from .models import NewsItem, CommunityMedia, UsefulPhone


@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'news_type_badge',
        'is_active_display',
        'priority',
        'author_link',
        'published_at',
        'updated_at'
    ]

    list_filter = [
        'news_type',
        'is_active',
        'published_at',
        'created_at'
    ]

    search_fields = ['title', 'content']

    readonly_fields = ['created_at', 'updated_at', 'published_at']

    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'content', 'news_type', 'priority')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Метаданные', {
            'fields': ('author', 'created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['make_active', 'make_inactive']

    # ============ КАСТОМНЫЕ ПОЛЯ ============

    def news_type_badge(self, obj):
        badges = {
            'news': ('📰 Новости', '#007bff'),
            'important': ('⚠️ Важная информация', '#dc3545'),
        }
        text, color = badges.get(obj.news_type, (obj.get_news_type_display(), '#6c757d'))
        return format_html(
            '<span style="padding:3px 10px; border-radius:12px; background:{}; color:white; font-weight:600;">{}</span>',
            color, text
        )

    news_type_badge.short_description = 'Тип'
    news_type_badge.admin_order_field = 'news_type'

    def is_active_display(self, obj):
        # 🔑 ИСПРАВЛЕНО: используем mark_safe вместо format_html без аргументов
        if obj.is_active:
            return mark_safe('<span style="color:#28a745; font-weight:bold;">✓ Активно</span>')
        return mark_safe('<span style="color:#dc3545; font-weight:bold;">✗ Скрыто</span>')

    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'

    def author_link(self, obj):
        if obj.author:
            return format_html(
                '<a href="/admin/accounts/customuser/{}/change/" target="_blank" style="color:#007bff;">{}</a>',
                obj.author.id,
                obj.author.username
            )
        return mark_safe('<span style="color:#6c757d">—</span>')  # ← Исправлено: используем mark_safe

    author_link.short_description = 'Автор'

    # ============ МАССОВЫЕ ДЕЙСТВИЯ ============

    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'✅ Активировано {count} записей.')

    make_active.short_description = '✅ Сделать активными'

    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'❌ Скрыто {count} записей.')

    make_inactive.short_description = '❌ Скрыть'

    # ============ АВТОЗАПОЛНЕНИЕ АВТОРА ============

    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(CommunityMedia)
class CommunityMediaAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type', 'village', 'is_published', 'order', 'uploaded_at']
    list_filter = ['media_type', 'village', 'is_published']
    search_fields = ['title', 'description']
    readonly_fields = ['uploaded_at']


# backend/community/admin.py

@admin.register(UsefulPhone)
class UsefulPhoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone_display', 'category_badge', 'is_active_display', 'order']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'phone', 'description']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'phone', 'category', 'description')
        }),
        ('Статус', {
            'fields': ('is_active', 'order')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['make_active', 'make_inactive']

    def phone_display(self, obj):
        return format_html('<a href="tel:{}">{}</a>', obj.phone.replace(' ', ''), obj.phone)

    phone_display.short_description = 'Телефон'

    def category_badge(self, obj):
        badges = {
            'emergency': ('🚨 Экстренные', '#dc3545'),
            'administration': ('🏛️ Администрация', '#007bff'),
            'medical': ('🏥 Медицинские', '#17a2b8'),
            'transport': ('🚌 Транспорт', '#ffc107'),
            'utility': ('💧 Коммунальные', '#28a745'),
            'other': ('ℹ️ Другое', '#6c757d'),
        }
        text, color = badges.get(obj.category, (obj.get_category_display(), '#6c757d'))
        return format_html(
            '<span style="padding:3px 10px; border-radius:12px; background:{}; color:white; font-weight:600;">{}</span>',
            color, text
        )

    category_badge.short_description = 'Категория'
    category_badge.admin_order_field = 'category'

    def is_active_display(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#28a745; font-weight:bold;">✓ Активен</span>')
        return mark_safe('<span style="color:#dc3545; font-weight:bold;">✗ Скрыт</span>')

    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'

    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'✅ Активировано {count} телефонов.')

    make_active.short_description = '✅ Сделать активными'

    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'❌ Скрыто {count} телефонов.')

    make_inactive.short_description = '❌ Скрыть'

