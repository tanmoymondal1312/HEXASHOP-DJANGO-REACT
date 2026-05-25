from django.urls import path

from .views import HeroSlidesView, SiteSettingsPublicView

urlpatterns = [
    path("", SiteSettingsPublicView.as_view(), name="site-settings"),
    path("hero-slides/", HeroSlidesView.as_view(), name="hero-slides"),
]
