from django.core.cache import cache
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SiteSettings
from .serializers import SiteSettingsPublicSerializer

_CACHE_KEY = "public_site_settings"
_CACHE_TTL = 300  # 5 minutes


class SiteSettingsPublicView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Build absolute URLs so the frontend gets a ready-to-use src for images.
        # We skip the shared cache here so build_absolute_uri uses the real host.
        obj = SiteSettings.load()
        data = SiteSettingsPublicSerializer(obj, context={"request": request}).data
        return Response(data)
