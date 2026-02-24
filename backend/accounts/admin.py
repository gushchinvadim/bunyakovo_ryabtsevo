# backend/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'village', 'is_verified', 'is_active',
                    'date_joined']
    list_filter = ['village', 'is_verified', 'is_active', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    # Добавляем поле is_verified в редактируемые поля
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('phone', 'village', 'avatar', 'is_verified')
        }),
    )

    # Добавляем массовые действия
    actions = ['verify_users', 'unverify_users']

    def verify_users(self, request, queryset):
        """Массовая верификация пользователей"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'Верифицировано {updated} пользователей.')

    verify_users.short_description = '✅ Верифицировать выбранных пользователей'

    def unverify_users(self, request, queryset):
        """Массовая отмена верификации"""
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'Отменена верификация для {updated} пользователей.')

    unverify_users.short_description = '❌ Отменить верификацию'