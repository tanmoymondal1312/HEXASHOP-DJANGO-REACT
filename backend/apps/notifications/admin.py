from django.contrib import admin
from django.utils.html import format_html

from .models import NewsletterSubscriber, StockAlert


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = ("email", "variant", "status_badge", "created_at", "sent_at")
    list_filter = ("status",)
    search_fields = ("email", "variant__product__name", "variant__sku")
    readonly_fields = ("created_at", "sent_at")
    date_hierarchy = "created_at"
    list_per_page = 30

    _STATUS_COLORS = {
        "pending": "#f39c12",
        "sent": "#27ae60",
        "cancelled": "#e74c3c",
    }

    def status_badge(self, obj):
        color = self._STATUS_COLORS.get(obj.status, "#777")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:10px;font-size:11px;font-weight:700;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("variant__product")


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active_badge", "subscribed_at", "unsubscribed_at")
    list_filter = ("is_active",)
    search_fields = ("email",)
    readonly_fields = ("subscribed_at", "unsubscribed_at")
    date_hierarchy = "subscribed_at"
    list_per_page = 50
    actions = ["mark_active", "mark_inactive"]

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color:#27ae60;font-weight:700;">✔ Active</span>'
            )
        return format_html(
            '<span style="color:#e74c3c;">✘ Unsubscribed</span>'
        )
    is_active_badge.short_description = "Status"
    is_active_badge.admin_order_field = "is_active"

    @admin.action(description="Mark selected as active")
    def mark_active(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Mark selected as unsubscribed")
    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)
