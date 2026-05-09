from django.contrib import admin
from django.utils.html import format_html

from .models import Wishlist, WishlistItem


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0
    readonly_fields = ("product", "added_at")
    fields = ("product", "added_at")


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "item_count_display", "created_at")
    search_fields = ("user__email", "user__username")
    readonly_fields = ("created_at",)
    inlines = [WishlistItemInline]
    list_per_page = 30

    def item_count_display(self, obj):
        return obj.items.count()
    item_count_display.short_description = "Items"


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("id", "wishlist", "product_display", "added_at")
    list_filter = ("added_at",)
    search_fields = ("product__name", "wishlist__user__email")
    readonly_fields = ("added_at",)
    raw_id_fields = ("wishlist", "product")
    date_hierarchy = "added_at"

    def product_display(self, obj):
        return format_html('<a href="/admin/products/product/{}/change/">{}</a>', obj.product.pk, obj.product.name)
    product_display.short_description = "Product"
