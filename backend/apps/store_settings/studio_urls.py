from rest_framework.routers import DefaultRouter

from .views import HeroAssetViewSet, HeroSlideViewSet

router = DefaultRouter()
router.register("hero-slides", HeroSlideViewSet, basename="studio-hero-slides")
router.register("hero-assets", HeroAssetViewSet, basename="studio-hero-assets")

urlpatterns = router.urls
