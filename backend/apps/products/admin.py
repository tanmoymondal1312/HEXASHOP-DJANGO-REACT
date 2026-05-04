from django.contrib import admin
from django.utils.html import format_html

from .models import Brand, Category, Product, ProductImage, ProductVariant, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "sort_order", "is_primary")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="60" />', obj.image.url)
        return "-"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ("sku", "name", "price", "stock", "attributes", "is_active")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "category", "brand", "base_price", "status",
        "is_featured", "avg_rating", "review_count",
    )
    list_filter = ("status", "is_featured", "category", "brand")
    search_fields = ("name", "slug", "sku")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("status", "is_featured")
    inlines = [ProductImageInline, ProductVariantInline]
    readonly_fields = ("avg_rating", "review_count", "sold_count", "view_count")
    fieldsets = (
        (None, {"fields": ("name", "slug", "sku", "category", "brand", "status", "is_featured")}),
        ("Pricing", {"fields": ("base_price", "compare_at_price", "cost_price")}),
        ("Content", {"fields": ("description", "short_description", "tags", "attributes")}),
        ("SEO", {"fields": ("meta_title", "meta_description")}),
        ("Stats", {"fields": ("avg_rating", "review_count", "sold_count", "view_count")}),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "is_verified_purchase", "created_at")
    list_filter = ("rating", "is_verified_purchase")
    search_fields = ("product__name", "user__email")
    readonly_fields = ("helpful_count",)
