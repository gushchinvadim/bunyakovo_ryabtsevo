# backend/community/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommunityMediaViewSet, NewsItemViewSet, UsefulPhoneViewSet

router = DefaultRouter()
router.register(r'media', CommunityMediaViewSet, basename='community-media')
router.register(r'news-items', NewsItemViewSet, basename='news-item')
router.register(r'useful-phones', UsefulPhoneViewSet, basename='useful-phone')

urlpatterns = [
    path('', include(router.urls)),
]