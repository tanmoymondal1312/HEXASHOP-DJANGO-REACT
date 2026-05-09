from django.contrib import admin
from django.utils.html import format_html

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("product", "variant", "quantity", "unit_price", "line_total", "added_at")
    fields = ("product", "variant", "quantity", "unit_price", "line_total", "added_at")

    def unit_price(self, obj):
        return f"${obj.unit_price}"
    unit_price.short_description = "Unit Price"

    def line_total(self, obj):
        return f"${obj.line_total}"
    line_total.short_description = "Line Total"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user_display", "item_count_display", "total_display", "created_at", "updated_at")
    list_filter = ("created_at", "updated_at")
    search_fields = ("user__email", "user__username", "session_key")
    readonly_fields = ("created_at", "updated_at")
    inlines = [CartItemInline]
    date_hierarchy = "created_at"
    list_per_page = 30

    def user_display(self, obj):
        if obj.user:
            return format_html('<a href="#">{}</a>', obj.user.email)
        return format_html('<span style="color:#999;">Guest ({})</span>', obj.session_key[:12] + "…" if obj.session_key else "—")
    user_display.short_description = "Customer"

    def item_count_display(self, obj):
        return obj.items.count()
    item_count_display.short_description = "Items"

    def total_display(self, obj):
        return f"${obj.total}"
    total_display.short_description = "Total"


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "variant", "quantity", "unit_price_display", "line_total_display", "added_at")
    list_filter = ("added_at",)
    search_fields = ("product__name", "cart__user__email", "variant__sku")
    readonly_fields = ("added_at",)
    raw_id_fields = ("cart", "product", "variant")

    def unit_price_display(self, obj):
        return f"${obj.unit_price}"
    unit_price_display.short_description = "Unit Price"

    def line_total_display(self, obj):
        return f"${obj.line_total}"
    line_total_display.short_description = "Line Total"
