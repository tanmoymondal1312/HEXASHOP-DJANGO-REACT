from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Banner, SiteSettings
from .serializers import HeroSlideSerializer, SiteSettingsPublicSerializer

_CACHE_KEY = "public_site_settings"
_CACHE_TTL = 300  # 5 minutes


class SiteSettingsPublicView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Build absolute URLs so the frontend gets a ready-to-use src for images.
        # We skip the shared cache here so build_absolute_uri uses the real host.
        obj = SiteSettings.load()
        data = SiteSettingsPublicSerializer(obj, context={"request": request}).data
        response = Response(data)
        response["Cache-Control"] = "public, max-age=300, s-maxage=600, stale-while-revalidate=3600"
        return response


class HeroSlidesView(APIView):
    """
    Returns active hero Banner slides ordered by sort_order.
    Respects valid_from / valid_to date windows.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        slides = (
            Banner.objects
            .filter(position="hero", is_active=True)
            .filter(Q(valid_from__isnull=True) | Q(valid_from__lte=now))
            .filter(Q(valid_to__isnull=True)   | Q(valid_to__gte=now))
            .order_by("sort_order", "-created_at")
        )
        data = HeroSlideSerializer(slides, many=True, context={"request": request}).data
        return Response(data)
