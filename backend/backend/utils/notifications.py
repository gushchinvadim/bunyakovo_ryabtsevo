# backend/utils/notifications.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_new_user_notification(user):
    """Отправка уведомления о новом пользователе администратору"""
    subject = f'🆕 Новый пользователь зарегистрирован: {user.username}'

    message = f"""
Новый пользователь зарегистрирован на сайте Буняково-Рябцево!

Имя пользователя: {user.username}
Email: {user.email}
Имя: {user.first_name or 'Не указано'}
Фамилия: {user.last_name or 'Не указано'}
Телефон: {user.phone or 'Не указан'}
Населённый пункт: {user.get_village_display()}

Дата регистрации: {user.date_joined.strftime('%d.%m.%Y %H:%M')}

Ссылка для просмотра в админке:
http://127.0.0.1:8000/admin/accounts/customuser/{user.id}/change/
    """.strip()

    # Получаем список администраторов из настроек
    admin_emails = [admin[1] for admin in settings.ADMINS] if hasattr(settings, 'ADMINS') else []

    if not admin_emails:
        print("⚠️ Предупреждение: не настроены адреса администраторов (ADMINS)")
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=False,
        )
        print(f"✅ Уведомление о новом пользователе {user.username} отправлено администраторам")
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления о новом пользователе: {e}")


def send_new_advertisement_notification(advertisement):
    """Отправка уведомления о новом объявлении администратору"""
    subject = f'📝 Новое объявление на модерацию: {advertisement.get_ad_type_display()}'

    # Формируем текст объявления
    ad_type_display = advertisement.get_ad_type_display()
    village_display = advertisement.get_village_display()

    message = f"""
Новое объявление требует модерации!

Тип: {ad_type_display}
Заголовок: {advertisement.title}
Автор: {advertisement.author.username} ({advertisement.author.email})
Населённый пункт: {village_display}
Телефон: {advertisement.phone or 'Не указан'}

Описание:
{advertisement.description}

Дата создания: {advertisement.created_at.strftime('%d.%m.%Y %H:%M')}

Ссылка для модерации:
http://127.0.0.1:8000/admin/marketplace/advertisement/{advertisement.id}/change/
    """.strip()

    # Получаем список администраторов
    admin_emails = [admin[1] for admin in settings.ADMINS] if hasattr(settings, 'ADMINS') else []

    if not admin_emails:
        print("⚠️ Предупреждение: не настроены адреса администраторов (ADMINS)")
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=False,
        )
        print(f"✅ Уведомление о новом объявлении '{advertisement.title}' отправлено администраторам")
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления о новом объявлении: {e}")


def send_updated_advertisement_notification(advertisement, old_status):
    """Отправка уведомления об обновлении объявления (после редактирования)"""
    subject = f'✏️ Объявление отредактировано: {advertisement.get_ad_type_display()}'

    message = f"""
Объявление было отредактировано и требует повторной модерации!

Старый статус: {dict(advertisement.MODERATION_STATUS_CHOICES)[old_status]}
Новый статус: {advertisement.get_moderation_status_display()}

Тип: {advertisement.get_ad_type_display()}
Заголовок: {advertisement.title}
Автор: {advertisement.author.username}

Ссылка для модерации:
http://127.0.0.1:8000/admin/marketplace/advertisement/{advertisement.id}/change/
    """.strip()

    admin_emails = [admin[1] for admin in settings.ADMINS] if hasattr(settings, 'ADMINS') else []

    if not admin_emails:
        print("⚠️ Предупреждение: не настроены адреса администраторов (ADMINS)")
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=False,
        )
        print(f"✅ Уведомление об обновлении объявления '{advertisement.title}' отправлено администраторам")
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления об обновлении объявления: {e}")