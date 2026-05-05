from django.contrib import admin
from django.utils.html import format_html

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "product_name",
        "variant_name",
        "sku",
        "quantity",
        "unit_price",
        "line_total",
    )
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "customer_display",
        "status_badge",
        "item_count",
        "total_display",
        "shipping_city",
        "created_at",
    )
    list_filter = ("status", "shipping_country", "created_at")
    search_fields = (
        "order_number",
        "user__email",
        "guest_email",
        "shipping_name",
        "promo_code",
    )
    readonly_fields = ("order_number", "created_at", "updated_at")
    list_per_page = 30
    date_hierarchy = "created_at"
    inlines = [OrderItemInline]
    save_on_top = True
    fieldsets = (
        (
            "Order Info",
            {
                "fields": (
                    "order_number",
                    "status",
                    "user",
                    "guest_email",
                    "promo_code",
                )
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "subtotal",
                    "shipping_cost",
                    "tax",
                    "discount",
                    "total",
                )
            },
        ),
        (
            "Shipping Address",
            {
                "fields": (
                    "shipping_name",
                    "shipping_phone",
                    "shipping_email",
                    "shipping_street",
                    "shipping_city",
                    "shipping_state",
                    "shipping_postal_code",
                    "shipping_country",
                )
            },
        ),
        (
            "Notes",
            {"fields": ("notes", "admin_notes")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    _STATUS_COLORS = {
        "pending": "#f39c12",
        "confirmed": "#3498db",
        "processing": "#9b59b6",
        "shipped": "#1abc9c",
        "delivered": "#27ae60",
        "cancelled": "#e74c3c",
        "refunded": "#95a5a6",
    }

    def customer_display(self, obj):
        if obj.user:
            return format_html(
                '<a href="#">{}</a>', obj.user.email
            )
        return obj.guest_email or "—"
    customer_display.short_description = "Customer"

    def status_badge(self, obj):
        color = self._STATUS_COLORS.get(obj.status, "#777")
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 12px;'
            'border-radius:12px;font-size:11px;font-weight:700;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"

    def total_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#2ecc71;">${}</span>', obj.total
        )
    total_display.short_description = "Total"
    total_display.admin_order_field = "total"

    def item_count(self, obj):
        count = obj.items.count()
        return format_html(
            '<span style="background:#eee;padding:2px 8px;border-radius:8px;">{}</span>',
            count,
        )
    item_count.short_description = "Items"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("user")
            .prefetch_related("items")
        )
