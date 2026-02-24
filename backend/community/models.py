# backend/community/models.py
from django.db import models
import os
from datetime import datetime
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class NewsItem(models.Model):
    """Модель для новостей и важной информации"""

    TYPE_CHOICES = [
        ('news', 'Новости'),
        ('important', 'Важная информация'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name='Заголовок'
    )

    content = models.TextField(
        verbose_name='Содержание'
    )

    news_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='news',
        verbose_name='Тип записи'
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name='Опубликовано'
    )

    priority = models.IntegerField(
        default=0,
        verbose_name='Приоритет (чем выше, тем выше в списке)'
    )

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Автор'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Дата публикации'
    )

    class Meta:
        verbose_name = 'Новость / Информация'
        verbose_name_plural = 'Новости и информация'
        ordering = ['-priority', '-published_at']

    def __str__(self):
        return f"{self.get_news_type_display()}: {self.title}"

    def save(self, *args, **kwargs):
        if self.is_active and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

def community_media_upload_path(instance, filename):
    """
    Динамический путь для загрузки медиа
    Формат: community/{photo|video}/{YYYY}/{MM}/{filename}
    """
    # Получаем расширение файла
    ext = os.path.splitext(filename)[1].lower()

    # Определяем тип на основе поля или расширения
    media_type = instance.media_type if hasattr(instance, 'media_type') else 'photo'

    # Получаем текущую дату
    now = datetime.now()
    year = now.strftime('%Y')
    month = now.strftime('%m')

    # Формируем путь
    return f'community/{media_type}/{year}/{month}/{filename}'


def community_thumbnail_upload_path(instance, filename):
    """Путь для миниатюр"""
    ext = os.path.splitext(filename)[1].lower()
    now = datetime.now()
    year = now.strftime('%Y')
    month = now.strftime('%m')
    return f'community/thumbnails/{year}/{month}/{filename}'


class CommunityMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('photo', 'Фотография'),
        ('video', 'Видео'),
    ]

    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True)
    media_type = models.CharField('Тип', max_length=10, choices=MEDIA_TYPE_CHOICES)
    file = models.FileField(
        'Файл',
        upload_to=community_media_upload_path,  # ← Функция вместо строки!
        help_text='Фото: до 5 МБ, Видео: до 100 МБ'
    )
    thumbnail = models.ImageField(
        'Превью',
        upload_to=community_thumbnail_upload_path,  # ← Функция!
        blank=True,
        null=True,
        help_text='Миниатюра для видео'
    )
    order = models.IntegerField('Порядок', default=0)
    is_published = models.BooleanField('Опубликовано', default=True)
    uploaded_at = models.DateTimeField('Загружено', auto_now_add=True)
    village = models.CharField(
        'Населённый пункт',
        max_length=50,
        choices=[
            ('bunyakovo', 'Буняково'),
            ('ryabtsevo', 'Рябцево'),
            ('all', 'Общее'),
        ],
        default='all'
    )

    class Meta:
        verbose_name = 'Медиа'
        verbose_name_plural = 'Медиа'
        ordering = ['order', '-uploaded_at']

    def __str__(self):
        return f"{self.get_media_type_display()} - {self.title}"

    @property
    def file_url(self):
        """Возвращает полный URL к файлу"""
        if self.file:
            return self.file.url
        return ''

    @property
    def thumbnail_url(self):
        """Возвращает полный URL к миниатюре"""
        if self.thumbnail:
            return self.thumbnail.url
        # Для фото используем само фото как миниатюру
        if self.media_type == 'photo' and self.file:
            return self.file.url
        return ''


class UsefulPhone(models.Model):
    """Модель для полезных телефонов"""

    CATEGORY_CHOICES = [
        ('emergency', 'Экстренные службы'),
        ('administration', 'Администрация'),
        ('medical', 'Медицинские'),
        ('transport', 'Транспорт'),
        ('utility', 'Коммунальные службы'),
        ('police', 'Полиция'),
        ('other', 'Другое'),
    ]

    name = models.CharField(
        max_length=200,
        verbose_name='Название организации/службы'
    )

    phone = models.CharField(
        max_length=20,
        verbose_name='Телефон'
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other',
        verbose_name='Категория'
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Дополнительная информация'
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен'
    )

    order = models.IntegerField(
        default=0,
        verbose_name='Порядок отображения'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    class Meta:
        verbose_name = 'Полезный телефон'
        verbose_name_plural = 'Полезные телефоны'
        ordering = ['order', 'category', 'name']

    def __str__(self):
            return f"{self.name}: {self.phone}"