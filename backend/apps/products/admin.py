from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html

from .models import Brand, Category, Product, ProductImage, ProductVariant, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image_preview", "image", "alt_text", "sort_order", "is_primary")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:56px;height:56px;object-fit:cover;'
                'border-radius:6px;border:1px solid #ddd;" />',
                obj.image.url,
            )
        return "—"
    image_preview.short_description = "Preview"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ("sku", "name", "price", "stock", "low_stock_threshold", "attributes", "is_active")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("product")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "product_count", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        (None, {"fields": ("name", "slug", "parent", "is_active", "sort_order")}),
        ("Content", {"fields": ("description", "image")}),
        ("SEO", {"fields": ("meta_title", "meta_description"), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_product_count=Count("products"))

    def product_count(self, obj):
        return format_html("<b>{}</b>", obj._product_count)
    product_count.short_description = "Products"
    product_count.admin_order_field = "_product_count"


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("logo_preview", "name", "slug", "product_count", "is_active")
    list_editable = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_product_count=Count("products"))

    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="height:32px;border-radius:4px;" />',
                obj.logo.url,
            )
        return "—"
    logo_preview.short_description = ""

    def product_count(self, obj):
        return obj._product_count
    product_count.short_description = "Products"
    product_count.admin_order_field = "_product_count"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "name",
        "category",
        "brand",
        "price_display",
        "stock_display",
        "status_badge",
        "is_featured",
        "avg_rating",
        "sold_count",
        "created_at",
    )
    list_filter = ("status", "is_featured", "category", "brand", "created_at")
    search_fields = ("name", "slug", "sku")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("is_featured",)
    list_per_page = 25
    date_hierarchy = "created_at"
    inlines = [ProductImageInline, ProductVariantInline]
    readonly_fields = (
        "avg_rating",
        "review_count",
        "sold_count",
        "view_count",
        "created_at",
        "updated_at",
    )
    save_on_top = True
    fieldsets = (
        (
            "Basic Info",
            {
                "fields": (
                    "name",
                    "slug",
                    "sku",
                    "category",
                    "brand",
                    "status",
                    "is_featured",
                )
            },
        ),
        (
            "Pricing",
            {"fields": ("base_price", "compare_at_price", "cost_price")},
        ),
        (
            "Content",
            {"fields": ("short_description", "description", "tags", "attributes")},
        ),
        (
            "SEO",
            {
                "fields": ("meta_title", "meta_description"),
                "classes": ("collapse",),
            },
        ),
        (
            "Stats (read-only)",
            {
                "fields": ("avg_rating", "review_count", "sold_count", "view_count"),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def thumbnail(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;'
                'border-radius:6px;" />',
                img.image.url,
            )
        return "—"
    thumbnail.short_description = ""

    def price_display(self, obj):
        if obj.compare_at_price and obj.compare_at_price > obj.base_price:
            pct = int(
                (obj.compare_at_price - obj.base_price) / obj.compare_at_price * 100
            )
            return format_html(
                '<span style="color:#e74c3c;font-weight:700;">${}</span> '
                '<span style="text-decoration:line-through;color:#999;font-size:11px;">${}</span> '
                '<span style="background:#e74c3c;color:#fff;font-size:10px;padding:1px 5px;'
                'border-radius:4px;">-{}%</span>',
                obj.base_price,
                obj.compare_at_price,
                pct,
            )
        return format_html(
            '<span style="font-weight:700;">${}</span>', obj.base_price
        )
    price_display.short_description = "Price"
    price_display.admin_order_field = "base_price"

    def stock_display(self, obj):
        total = sum(v.stock for v in obj.variants.all())
        if total == 0:
            return format_html(
                '<span style="color:#e74c3c;font-weight:700;">Out of Stock</span>'
            )
        if total <= 10:
            return format_html(
                '<span style="color:#f39c12;font-weight:700;">Low: {}</span>', total
            )
        return format_html(
            '<span style="color:#27ae60;font-weight:600;">{}</span>', total
        )
    stock_display.short_description = "Stock"

    def status_badge(self, obj):
        colors = {
            "draft": "#f39c12",
            "active": "#27ae60",
            "archived": "#e74c3c",
        }
        color = colors.get(obj.status, "#777")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:10px;font-size:11px;font-weight:700;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("category", "brand")
            .prefetch_related("images", "variants")
        )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "user",
        "rating_stars",
        "title",
        "is_verified_purchase",
        "helpful_count",
        "created_at",
    )
    list_filter = ("rating", "is_verified_purchase", "created_at")
    search_fields = ("product__name", "user__email", "title", "body")
    readonly_fields = ("helpful_count", "created_at", "updated_at")
    date_hierarchy = "created_at"
    list_per_page = 30

    def rating_stars(self, obj):
        filled = "★" * obj.rating
        empty = "☆" * (5 - obj.rating)
        return format_html(
            '<span style="color:#f39c12;font-size:16px;">{}</span>'
            '<span style="color:#ccc;font-size:16px;">{}</span>',
            filled,
            empty,
        )
    rating_stars.short_description = "Rating"
    rating_stars.admin_order_field = "rating"
