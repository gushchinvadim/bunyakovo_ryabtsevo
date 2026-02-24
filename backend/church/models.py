# backend/church/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class Priest(models.Model):
    """Модель для священника (батюшки)"""

    name = models.CharField(
        max_length=200,
        verbose_name='Имя и отчество'
    )

    title = models.CharField(
        max_length=100,
        default='Настоятель храма',
        verbose_name='Должность'
    )

    phone = models.CharField(
        max_length=20,
        verbose_name='Телефон для связи'
    )

    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name='Email'
    )

    photo = models.ImageField(
        upload_to='church/priests/',
        blank=True,
        null=True,
        verbose_name='Фотография'
    )

    biography = models.TextField(
        blank=True,
        null=True,
        verbose_name='Краткая биография'
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
        verbose_name = 'Священник'
        verbose_name_plural = 'Священники'
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.title})"


# backend/church/models.py

class ServiceSchedule(models.Model):
    """Модель для расписания богослужений"""

    DAY_CHOICES = [
        ('monday', 'Понедельник'),
        ('tuesday', 'Вторник'),
        ('wednesday', 'Среда'),
        ('thursday', 'Четверг'),
        ('friday', 'Пятница'),
        ('saturday', 'Суббота'),
        ('sunday', 'Воскресенье'),
        ('holiday', 'Праздничный день'),
    ]

    day_of_week = models.CharField(
        max_length=20,
        choices=DAY_CHOICES,
        verbose_name='День недели'
    )

    date = models.DateField(  # ← Новое поле
        blank=True,
        null=True,
        verbose_name='Дата (необязательно)'
    )

    service_name = models.CharField(
        max_length=200,
        verbose_name='Название службы'
    )

    time = models.TimeField(
        verbose_name='Время начала'
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Дополнительная информация'
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name='Активно'
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
        verbose_name = 'Расписание богослужения'
        verbose_name_plural = 'Расписание богослужений'
        ordering = ['day_of_week', 'date', 'order', 'time']

    def __str__(self):
        date_str = f" ({self.date.strftime('%d.%m.%Y')})" if self.date else ""
        return f"{self.get_day_of_week_display()}{date_str} - {self.service_name} ({self.time.strftime('%H:%M')})"

class ChurchAnnouncement(models.Model):
    """Модель для объявлений от батюшки"""

    ANNOUNCEMENT_TYPE_CHOICES = [
        ('general', 'Общее объявление'),
        ('service', 'Объявление о службе'),
        ('event', 'Объявление о мероприятии'),
        ('prayer', 'Молитвенное объявление'),
        ('urgent', 'Срочное объявление'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name='Заголовок'
    )

    content = models.TextField(
        verbose_name='Содержание'
    )

    announcement_type = models.CharField(
        max_length=20,
        choices=ANNOUNCEMENT_TYPE_CHOICES,
        default='general',
        verbose_name='Тип объявления'
    )

    priest = models.ForeignKey(
        Priest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Автор (батюшка)'
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name='Опубликовано'
    )

    priority = models.IntegerField(
        default=0,
        verbose_name='Приоритет (чем выше, тем выше в списке)'
    )

    valid_from = models.DateTimeField(
        default=timezone.now,
        verbose_name='Действует с'
    )

    valid_until = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Действует до'
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
        verbose_name = 'Объявление от батюшки'
        verbose_name_plural = 'Объявления от батюшки'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return self.title

    def is_valid(self):
        """Проверка актуальности объявления"""
        now = timezone.now()
        if self.valid_until:
            return self.valid_from <= now <= self.valid_until
        return self.valid_from <= now


class ChurchMedia(models.Model):
    """Модель для медиафайлов церкви (фото и видео)"""

    MEDIA_TYPE_CHOICES = [
        ('photo', 'Фотография'),
        ('video', 'Видео'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name='Название'
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Описание'
    )

    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPE_CHOICES,
        default='photo',
        verbose_name='Тип медиа'
    )

    file = models.FileField(
        upload_to='church/media/',
        verbose_name='Файл'
    )

    thumbnail = models.ImageField(
        upload_to='church/media/thumbnails/',
        blank=True,
        null=True,
        verbose_name='Миниатюра (для видео)'
    )

    event_date = models.DateField(
        verbose_name='Дата события'
    )

    priest = models.ForeignKey(
        Priest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Священник на фото/видео'
    )

    is_published = models.BooleanField(
        default=False,
        verbose_name='Опубликовано (прошло модерацию)'
    )

    order = models.IntegerField(
        default=0,
        verbose_name='Порядок отображения'
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата загрузки'
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Загрузил'
    )

    class Meta:
        verbose_name = 'Медиафайл церкви'
        verbose_name_plural = 'Медиафайлы церкви'
        ordering = ['-event_date', '-order']

    def __str__(self):
        return f"{self.get_media_type_display()}: {self.title}"