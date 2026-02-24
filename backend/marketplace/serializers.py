# backend/marketplace/serializers.py
from rest_framework import serializers
from django.db import models
from .models import Advertisement, AdvertisementImage
from accounts.serializers import UserSerializer


class AdvertisementImageSerializer(serializers.ModelSerializer):
    """Сериализатор для изображений объявления"""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AdvertisementImage
        fields = ['id', 'image', 'image_url', 'order', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class AdvertisementSerializer(serializers.ModelSerializer):
    """Сериализатор для объявления (чтение)"""

    author = UserSerializer(read_only=True)
    images = AdvertisementImageSerializer(many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()
    contact_info = serializers.SerializerMethodField()

    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'description', 'ad_type', 'price',
            'phone', 'email', 'address',
            'author', 'village', 'moderation_status', 'moderation_comment',
            'is_active', 'views', 'created_at', 'updated_at',
            'images', 'main_image_url', 'contact_info'
        ]
        read_only_fields = [
            'author', 'moderation_status', 'moderation_comment',
            'views', 'created_at', 'updated_at'
        ]

    def get_main_image_url(self, obj):
        """Возвращает абсолютный URL главного изображения"""
        request = self.context.get('request')
        first_image = obj.images.first()
        if first_image and first_image.image:
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url  # Относительный путь как фолбэк
        return None

    def get_contact_info(self, obj):
        return obj.contact_info


class AdvertisementCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания объявления"""

    # Принимаем до 3 изображений
    images = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000,
            allow_empty_file=False,
            use_url=False
        ),
        write_only=True,
        required=False,
        max_length=3,
        help_text='Можно загрузить до 3 изображений'
    )

    class Meta:
        model = Advertisement
        fields = [
            'title', 'description', 'ad_type', 'price',
            'phone', 'email', 'address',
            'village', 'images'
        ]

    def validate(self, attrs):
        """Валидация полей"""
        ad_type = attrs.get('ad_type')
        price = attrs.get('price')

        # Проверка цены для определённых типов объявлений
        if ad_type in ['sale', 'rent'] and price is None:
            raise serializers.ValidationError({
                'price': 'Для объявлений "Продам" и "Сдам в аренду" необходимо указать цену.'
            })

        if ad_type == 'free' and price is not None:
            raise serializers.ValidationError({
                'price': 'Для объявлений "Отдам в хорошие руки" цена не указывается.'
            })

        # Проверка контактов
        phone = attrs.get('phone')
        email = attrs.get('email')

        if not phone and not email:
            raise serializers.ValidationError({
                'phone': 'Укажите хотя бы один контакт: телефон или email.'
            })

        return attrs

    def validate_images(self, value):
        """Проверка количества изображений"""
        if len(value) > 3:
            raise serializers.ValidationError(
                "Можно загрузить максимум 3 изображения."
            )
        return value

    def create(self, validated_data):
        """Создание объявления с изображениями"""
        # Извлекаем изображения из данных
        images_data = validated_data.pop('images', [])

        # 🔑 КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: удаляем 'author' если он попал в данные
        validated_data.pop('author', None)

        # Создаём объявление (статус по умолчанию: 'pending')
        advertisement = Advertisement.objects.create(
            author=self.context['request'].user,  # ← Автор берётся из запроса
            **validated_data
        )

        # Создаём изображения
        for i, image_data in enumerate(images_data):
            AdvertisementImage.objects.create(
                advertisement=advertisement,
                image=image_data,
                order=i
            )

        return advertisement