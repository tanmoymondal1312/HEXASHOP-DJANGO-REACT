from django.urls import path

from .views import SiteSettingsPublicView

urlpatterns = [
    path("", SiteSettingsPublicView.as_view(), name="site-settings"),
]
