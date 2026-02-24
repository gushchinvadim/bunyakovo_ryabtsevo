# backend/marketplace/notifications.py
import requests
from django.conf import settings


def send_telegram_notification(advertisement, action_type):
    """Отправка уведомления в Telegram"""
    try:
        # Получаем токен и чат из настроек
        bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
        chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', None)

        if not bot_token or not chat_id:
            return

        status_emoji = '🆕' if action_type == 'created' else '✏️'
        ad_type_emoji = {
            'sale': '💰',
            'buy': '🛒',
            'rent': '🏠',
            'free': '🎁'
        }.get(advertisement.ad_type, '📄')

        village_names = {
            'bunyakovo': 'Буняково',
            'ryabtsevo': 'Рябцево',
            'other': 'Другое'
        }

        message = f"""
{status_emoji} Требуется модерация!

{ad_type_emoji} {advertisement.get_ad_type_display()}
🏘️ {village_names.get(advertisement.village, advertisement.village)}
👤 {advertisement.author.username}
📱 {advertisement.phone or 'нет телефона'}

«{advertisement.title}»

🔗 http://ваш-сайт.ru/admin/marketplace/advertisement/{advertisement.id}/change/
        """.strip()

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        requests.post(url, data={
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }, timeout=5)

    except Exception as e:
        print(f"Ошибка отправки в Telegram: {e}")