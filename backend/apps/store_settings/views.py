from django.core.cache import cache
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SiteSettings
from .serializers import SiteSettingsPublicSerializer

_CACHE_KEY = "public_site_settings"
_CACHE_TTL = 300  # 5 minutes


class SiteSettingsPublicView(APIView):
    """Public endpoint that exposes only the fields the frontend needs."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cached = cache.get(_CACHE_KEY)
        if cached is not None:
            return Response(cached)

        data = SiteSettingsPublicSerializer(SiteSettings.load()).data
        cache.set(_CACHE_KEY, data, _CACHE_TTL)
        return Response(data)
