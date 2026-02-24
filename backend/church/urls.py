# backend/church/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PriestViewSet, ServiceScheduleViewSet, ChurchAnnouncementViewSet, ChurchMediaViewSet

router = DefaultRouter()
router.register(r'priests', PriestViewSet, basename='priest')
router.register(r'schedule', ServiceScheduleViewSet, basename='schedule')
router.register(r'announcements', ChurchAnnouncementViewSet, basename='announcement')
router.register(r'media', ChurchMediaViewSet, basename='church-media')

urlpatterns = [
    path('', include(router.urls)),
]