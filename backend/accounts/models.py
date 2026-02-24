
# backend/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Кастомная модель пользователя"""

    VILLAGE_CHOICES = [
        ('bunyakovo', 'Буняково'),
        ('ryabtsevo', 'Рябцево'),
    ]

    phone = models.CharField(
        'Телефон',
        max_length=20,
        blank=True,
        help_text='Контактный телефон'
    )

    village = models.CharField(
        'Населённый пункт',
        max_length=50,
        choices=VILLAGE_CHOICES,
        blank=True
    )

    avatar = models.ImageField(
        'Аватар',
        upload_to='profiles/%Y/%m/',
        blank=True,
        null=True
    )

    is_verified = models.BooleanField(
        'Верифицирован',
        default=False,
        help_text='Подтверждён ли пользователь администратором'
    )

    created_at = models.DateTimeField(
        'Дата регистрации',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_village_display()})"

    @property
    def full_name(self):
        """Полное имя пользователя"""
        return f"{self.first_name} {self.last_name}".strip() or self.username