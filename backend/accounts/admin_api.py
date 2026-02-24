# backend/accounts/admin_api.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
def unverified_users_count(request):
    """Возвращает количество не верифицированных пользователей"""
    count = User.objects.filter(is_verified=False).count()
    return Response({'count': count})