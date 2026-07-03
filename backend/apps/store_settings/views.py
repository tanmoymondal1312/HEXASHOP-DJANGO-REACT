from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HeroAsset, HeroSlide, SiteSettings
from .serializers import (
    HeroAssetSerializer,
    HeroSlideAdminSerializer,
    HeroSlidePublicSerializer,
    SiteSettingsPublicSerializer,
)


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
    """Public: active hero slides (JSON documents) ordered by sort_order,
    respecting valid_from / valid_to windows."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        slides = (
            HeroSlide.objects
            .filter(is_active=True)
            .filter(Q(valid_from__isnull=True) | Q(valid_from__lte=now))
            .filter(Q(valid_to__isnull=True) | Q(valid_to__gte=now))
            .order_by("sort_order", "-created_at")
        )
        data = HeroSlidePublicSerializer(
            slides, many=True, context={"request": request}
        ).data
        response = Response(data)
        response["Cache-Control"] = "public, max-age=60, s-maxage=120, stale-while-revalidate=600"
        return response


# ── Staff-only studio API (/api/v1/studio/…) ──────────────────────────────────
class HeroSlideViewSet(viewsets.ModelViewSet):
    """Full CRUD + reorder for hero slides. Staff only."""
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None  # small admin list — return a plain array

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Body: [{"id": 1, "sort_order": 0}, ...]"""
        items = request.data if isinstance(request.data, list) else request.data.get("order", [])
        id_to_order = {int(i["id"]): int(i["sort_order"]) for i in items}
        slides = list(HeroSlide.objects.filter(id__in=id_to_order.keys()))
        for slide in slides:
            slide.sort_order = id_to_order[slide.id]
        HeroSlide.objects.bulk_update(slides, ["sort_order"])
        data = HeroSlideAdminSerializer(
            self.get_queryset(), many=True, context={"request": request}
        ).data
        return Response(data)


class HeroAssetViewSet(viewsets.ModelViewSet):
    """Upload / list / delete hero media assets. Staff only."""
    queryset = HeroAsset.objects.all()
    serializer_class = HeroAssetSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ["get", "post", "delete", "head", "options"]
