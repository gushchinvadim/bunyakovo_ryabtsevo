# backend/marketplace/models.py
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator


class Advertisement(models.Model):
    """Модель объявления"""

    AD_TYPE_CHOICES = [
        ('sale', 'Продам'),
        ('buy', 'Куплю'),
        ('rent', 'Сдам в аренду'),
        ('free', 'Отдам в хорошие руки'),
        ('handmade', 'Услуги мастера'),
    ]

    VILLAGE_CHOICES = [
        ('bunyakovo', 'Буняково'),
        ('ryabtsevo', 'Рябцево'),
        ('other', 'Я из другого места'),
    ]

    MODERATION_STATUS_CHOICES = [
        ('pending', 'На модерации'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]

    title = models.CharField(
        'Заголовок',
        max_length=200,
        help_text='Краткое описание объявления'
    )

    description = models.TextField(
        'Описание',
        help_text='Подробное описание товара/услуги'
    )

    ad_type = models.CharField(
        'Тип объявления',
        max_length=20,
        choices=AD_TYPE_CHOICES,
        default='sale'
    )

    price = models.DecimalField(
        'Цена',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Укажите цену (для "Продам", "Сдам в аренду")'
    )

    phone = models.CharField(
        'Телефон для связи',
        max_length=20,
        blank=True,
        help_text='Контактный телефон'
    )

    email = models.EmailField(
        'Email для связи',
        blank=True,
        help_text='Контактный email'
    )

    address = models.CharField(
        'Адрес',
        max_length=200,
        blank=True,
        help_text='Улица, дом (опционально)'
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='advertisements',
        verbose_name='Автор'
    )

    village = models.CharField(
        'Населённый пункт',
        max_length=50,
        choices=VILLAGE_CHOICES,
        default='bunyakovo'
    )

    moderation_status = models.CharField(
        'Статус модерации',
        max_length=20,
        choices=MODERATION_STATUS_CHOICES,
        default='pending',
        help_text='Статус проверки администратором'
    )

    moderation_comment = models.TextField(
        'Комментарий модератора',
        blank=True,
        help_text='Причина отклонения (если отклонено)'
    )

    is_active = models.BooleanField(
        'Активно',
        default=True,
        help_text='Показывать объявление в списке'
    )

    views = models.IntegerField(
        'Просмотры',
        default=0
    )

    created_at = models.DateTimeField(
        'Дата создания',
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        'Дата обновления',
        auto_now=True
    )

    class Meta:
        verbose_name = 'Объявление'
        verbose_name_plural = 'Объявления'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_ad_type_display()} - {self.title}"

    @property
    def main_image_url(self):
        """Возвращает URL главного изображения"""
        first_image = self.images.first()
        if first_image and first_image.image:
            return first_image.image.url
        return None

    @property
    def contact_info(self):
        """Возвращает информацию для контакта"""
        contacts = []
        if self.phone:
            contacts.append(f"📞 {self.phone}")
        if self.email:
            contacts.append(f"✉️ {self.email}")
        if self.address:
            contacts.append(f"📍 {self.address}")
        return '\n'.join(contacts)


class AdvertisementImage(models.Model):
    """Модель изображений для объявления"""

    advertisement = models.ForeignKey(
        Advertisement,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Объявление'
    )

    image = models.ImageField(
        'Изображение',
        upload_to='ads/%Y/%m/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
        ],
        help_text='Поддерживаются форматы: JPG, PNG, WebP'
    )

    order = models.PositiveIntegerField(
        'Порядок',
        default=0,
        help_text='Порядок отображения (0 - первое)'
    )

    uploaded_at = models.DateTimeField(
        'Дата загрузки',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Изображение объявления'
        verbose_name_plural = 'Изображения объявлений'
        ordering = ['order', 'uploaded_at']
        constraints = [
            models.UniqueConstraint(
                fields=['advertisement', 'order'],
                name='unique_advertisement_image_order'
            )
        ]

    def __str__(self):
        return f"Изображение {self.order + 1} для {self.advertisement.title}"

    @property
    def image_url(self):
        """Возвращает полный URL к изображению"""
        if self.image:
            return self.image.url
        return None