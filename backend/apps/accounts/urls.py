from django.urls import path

from .views import (
    AddressDetailView,
    AddressViewSet,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    TokenRefreshCookieView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshCookieView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("addresses/", AddressViewSet.as_view(), name="auth-addresses"),
    path("addresses/<int:pk>/", AddressDetailView.as_view(), name="auth-address-detail"),
]
