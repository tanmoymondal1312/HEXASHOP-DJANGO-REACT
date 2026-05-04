from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.cart.utils import merge_guest_cart
from .models import Address, AuditLog
from .serializers import (
    AddressSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"


def _set_auth_cookies(response: Response, refresh: RefreshToken) -> Response:
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    secure = not settings.DEBUG
    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/",
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/api/v1/auth/token/refresh/",
    )
    return response


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response(
            UserSerializer(user).data, status=status.HTTP_201_CREATED
        )
        _set_auth_cookies(response, refresh)
        AuditLog.objects.create(
            user=user, action="register", ip_address=_get_client_ip(request)
        )
        # Merge any guest cart if session key provided
        guest_key = request.data.get("guest_session_key")
        if guest_key:
            merge_guest_cart(guest_key, user)
        return response


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = serializer.validated_data["refresh"]
        user = User.objects.get(email=request.data["email"])
        response = Response(
            UserSerializer(user).data, status=status.HTTP_200_OK
        )
        _set_auth_cookies(response, RefreshToken(refresh))
        AuditLog.objects.create(
            user=user, action="login", ip_address=_get_client_ip(request)
        )
        guest_key = request.data.get("guest_session_key")
        if guest_key:
            merge_guest_cart(guest_key, user)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get(REFRESH_COOKIE)
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
        response = Response({"detail": "Logged out successfully."})
        response.delete_cookie(ACCESS_COOKIE)
        response.delete_cookie(REFRESH_COOKIE)
        AuditLog.objects.create(
            user=request.user, action="logout", ip_address=_get_client_ip(request)
        )
        return response


class TokenRefreshCookieView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh_token:
            return Response(
                {"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            old_refresh = RefreshToken(refresh_token)
            new_refresh = RefreshToken.for_user(
                User.objects.get(id=old_refresh["user_id"])
            )
            old_refresh.blacklist()
        except (TokenError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED
            )
        response = Response({"detail": "Token refreshed."})
        _set_auth_cookies(response, new_refresh)
        return response


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AddressViewSet(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


def _get_client_ip(request) -> str | None:
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
