from rest_framework import serializers

from .models import Banner, SiteSettings


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


class HeroSlideSerializer(serializers.ModelSerializer):
    """Serialises active hero-position Banner rows for the frontend slider."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = (
            "id",
            "title",
            "heading_accent",
            "badge_text",
            "subtitle",
            "description",
            "accent_color",
            "image_url",
            "cta_text",
            "cta_url",
            "secondary_cta_text",
            "secondary_cta_url",
            "sort_order",
        )

    def get_image_url(self, obj) -> str | None:
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url or None
