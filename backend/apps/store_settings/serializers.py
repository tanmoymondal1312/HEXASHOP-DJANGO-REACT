import copy

from rest_framework import serializers

from .models import HeroAsset, HeroSlide, SiteSettings


class SiteSettingsPublicSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = (
            "announcement_bar_text",
            "announcement_bar_is_active",
            "announcement_bar_link",
            "announcement_bar_bg_color",
            "announcement_bar_text_color",
            "free_shipping_threshold",
            "hero_image_url",
            "hero_image_alt",
        )

    def get_hero_image_url(self, obj) -> str | None:
        if not obj.hero_image:
            return None
        request = self.context.get("request")
        url = obj.hero_image.url
        if request:
            return request.build_absolute_uri(url)
        return url


# ── Hero Builder ──────────────────────────────────────────────────────────────
def _absolutize_document_image(document, request):
    """Return a copy of the slide document with any Django-served /media image
    URL made absolute. Next.js-served paths (e.g. /slides/…) are left as-is."""
    if not isinstance(document, dict):
        return document
    img = document.get("image")
    url = img.get("url") if isinstance(img, dict) else None
    if request and url and url.startswith("/media"):
        document = copy.deepcopy(document)
        document["image"]["url"] = request.build_absolute_uri(url)
    return document


class HeroAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = HeroAsset
        fields = ("id", "url", "image", "uploaded_at")
        extra_kwargs = {"image": {"write_only": True}}

    def get_url(self, obj) -> str | None:
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class HeroSlidePublicSerializer(serializers.ModelSerializer):
    """Read-only payload the storefront consumes."""

    document = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = ("id", "name", "document", "sort_order")

    def get_document(self, obj):
        return _absolutize_document_image(obj.document, self.context.get("request"))


class HeroSlideAdminSerializer(serializers.ModelSerializer):
    """Full read/write payload for the staff-only studio."""

    document = serializers.JSONField()

    class Meta:
        model = HeroSlide
        fields = (
            "id", "name", "document", "schema_version",
            "is_active", "sort_order", "valid_from", "valid_to",
            "created_at", "updated_at",
        )
        read_only_fields = ("schema_version", "created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["document"] = _absolutize_document_image(
            data.get("document"), self.context.get("request")
        )
        return data
