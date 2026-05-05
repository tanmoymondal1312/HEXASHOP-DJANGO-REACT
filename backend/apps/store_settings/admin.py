from django.contrib import admin
from django.utils.html import format_html

from .models import Banner, PromoCode, SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "📢 Announcement Bar",
            {
                "fields": (
                    "announcement_bar_is_active",
                    "announcement_bar_text",
                    "announcement_bar_link",
                    "announcement_bar_bg_color",
                    "announcement_bar_text_color",
                ),
                "description": (
                    "Manage the top announcement banner shown across the entire store. "
                    "This is where you control messages like sale alerts and promotions."
                ),
            },
        ),
        (
            "🚚 Shipping",
            {
                "fields": ("free_shipping_threshold",),
            },
        ),
        (
            "🔍 SEO",
            {
                "fields": ("meta_title", "meta_description", "meta_keywords"),
                "classes": ("collapse",),
            },
        ),
        (
            "🔧 Maintenance Mode",
            {
                "fields": ("is_maintenance_mode", "maintenance_message"),
                "classes": ("collapse",),
                "description": "When enabled, visitors see a maintenance notice instead of the store.",
            },
        ),
        (
            "📱 Social Media",
            {
                "fields": (
                    "facebook_url",
                    "instagram_url",
                    "twitter_url",
                    "youtube_url",
                    "tiktok_url",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "📞 Contact Info",
            {
                "fields": ("support_email", "support_phone"),
            },
        ),
    )
    readonly_fields = ("updated_at",)

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # Redirect straight to the single settings object
        obj = SiteSettings.load()
        from django.shortcuts import redirect
        from django.urls import reverse
        return redirect(
            reverse("admin:store_settings_sitesettings_change", args=[obj.pk])
        )


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = (
        "image_preview",
        "title",
        "position",
        "sort_order",
        "is_active",
        "valid_from",
        "valid_to",
    )
    list_editable = ("sort_order", "is_active")
    list_filter = ("position", "is_active")
    search_fields = ("title", "subtitle")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "subtitle",
                    "image",
                    "image_url",
                    "image_preview_readonly",
                )
            },
        ),
        (
            "Call to Action",
            {"fields": ("cta_text", "cta_url")},
        ),
        (
            "Placement & Visibility",
            {"fields": ("position", "sort_order", "is_active", "valid_from", "valid_to")},
        ),
    )
    readonly_fields = ("image_preview_readonly",)

    def image_preview(self, obj):
        src = obj.image.url if obj.image else obj.image_url
        if src:
            return format_html(
                '<img src="{}" style="height:44px;border-radius:6px;object-fit:cover;" />',
                src,
            )
        return "—"
    image_preview.short_description = "Preview"

    def image_preview_readonly(self, obj):
        src = obj.image.url if obj.image else obj.image_url
        if src:
            return format_html(
                '<img src="{}" style="max-height:200px;border-radius:8px;" />',
                src,
            )
        return "No image uploaded yet."
    image_preview_readonly.short_description = "Current Image"


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "discount_value_display",
        "min_order_amount",
        "uses_count",
        "uses_remaining_display",
        "valid_to",
        "is_active",
    )
    list_editable = ("is_active",)
    list_filter = ("discount_type", "is_active")
    search_fields = ("code", "description")
    readonly_fields = ("uses_count", "created_at")
    fieldsets = (
        (
            "Code",
            {"fields": ("code", "description", "is_active")},
        ),
        (
            "Discount Rules",
            {
                "fields": (
                    "discount_type",
                    "discount_value",
                    "min_order_amount",
                    "max_discount_amount",
                )
            },
        ),
        (
            "Validity & Usage",
            {"fields": ("max_uses", "uses_count", "valid_from", "valid_to")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at",), "classes": ("collapse",)},
        ),
    )

    def discount_value_display(self, obj):
        if obj.discount_type == "PERCENTAGE":
            return f"{obj.discount_value}%"
        if obj.discount_type == "FIXED":
            return f"${obj.discount_value}"
        return "Free Shipping"
    discount_value_display.short_description = "Value"

    def uses_remaining_display(self, obj):
        remaining = obj.uses_remaining
        if remaining is None:
            return format_html(
                '<span style="color:#27ae60;font-weight:600;">∞ Unlimited</span>'
            )
        if remaining == 0:
            return format_html(
                '<span style="color:#e74c3c;font-weight:600;">Exhausted</span>'
            )
        return format_html(
            '<span style="color:#f39c12;font-weight:600;">{}</span>', remaining
        )
    uses_remaining_display.short_description = "Remaining"
