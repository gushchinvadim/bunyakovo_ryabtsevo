# backend/accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
# backend/accounts/views.py
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer
from backend.utils.notifications import send_new_user_notification  # ← Добавляем импорт


# class RegisterView(APIView):
#     """Регистрация нового пользователя"""
#     permission_classes = []
#
#     def post(self, request, *args, **kwargs):
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#
#             # 🔑 Отправляем уведомление администратору о новом пользователе
#             send_new_user_notification(user)
#
#             return Response({
#                 'message': 'Регистрация успешна! Ожидайте верификации администратором.',
#                 'user': UserSerializer(user).data
#             }, status=status.HTTP_201_CREATED)
#
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    """Регистрация нового пользователя"""

    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Создаём JWT токены
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Регистрация успешна! Пожалуйста, дождитесь верификации администратором.'
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Вход в систему"""

    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    # backend/accounts/views.py (класс LoginView)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user is not None:
            # 🔑 УБРАЛИ проверку is_verified — все зарегистрированные пользователи могут входить
            # Было: if not user.is_verified: return Response({...}, 403)

            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({
                'error': 'Неверное имя пользователя или пароль.'
            }, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Профиль пользователя (просмотр и редактирование)"""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user