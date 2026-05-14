from rest_framework import serializers

from .models import Brand, Category, Product, ProductColor, ProductImage, ProductVariant, Review


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "children", "sort_order")

    def get_children(self, obj):
        if hasattr(obj, "prefetched_children"):
            children = obj.prefetched_children
        else:
            children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "logo")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order", "is_primary")


class ProductColorSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = ProductColor
        fields = ("id", "name", "hex_code", "image_url", "sort_order")

    def get_image_url(self, obj) -> str | None:
        if not (obj.image and obj.image.image):
            return None
        url     = obj.image.image.url
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.ReadOnlyField()
    is_in_stock     = serializers.ReadOnlyField()
    is_low_stock    = serializers.ReadOnlyField()
    color_id        = serializers.IntegerField(source="color.id", read_only=True, default=None)
    color_name      = serializers.CharField(source="color.name", read_only=True, default=None)

    class Meta:
        model  = ProductVariant
        fields = (
            "id", "sku", "color_id", "color_name", "size",
            "price", "effective_price", "stock",
            "is_active", "is_in_stock", "is_low_stock",
        )


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "id", "user_name", "rating", "title", "body",
            "is_verified_purchase", "helpful_count", "created_at",
        )

    def get_user_name(self, obj) -> str:
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "Anonymous"

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    first_variant = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, default=None)
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "base_price", "compare_at_price",
            "discount_percentage", "primary_image", "category_name",
            "brand_name", "avg_rating", "review_count", "is_featured",
            "first_variant",
        )

    def get_first_variant(self, obj):
        """Return the first active in-stock variant id (for Quick Add from listings)."""
        variants = getattr(obj, "prefetched_variants", None)
        if variants is None:
            v = obj.variants.filter(is_active=True).first()
        else:
            in_stock = [v for v in variants if v.is_active and v.stock > 0]
            v = in_stock[0] if in_stock else (variants[0] if variants else None)
        if v:
            return {"id": v.id, "is_in_stock": v.is_in_stock, "stock": v.stock}
        return None

    def get_primary_image(self, obj) -> str | None:
        images = getattr(obj, "prefetched_images", None)
        if images is None:
            img = obj.images.filter(is_primary=True).first()
        else:
            primary = [i for i in images if i.is_primary]
            img = primary[0] if primary else (images[0] if images else None)
        if img and img.image:
            url = img.image.url
            # Build absolute URL so Next.js Image (port 3000) can load from
            # the Django media server (port 8000).
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images    = ProductImageSerializer(many=True, read_only=True)
    variants  = ProductVariantSerializer(many=True, read_only=True)
    colors    = ProductColorSerializer(many=True, read_only=True)
    category  = CategorySerializer(read_only=True)
    brand     = BrandSerializer(read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    reviews   = ReviewSerializer(many=True, read_only=True, source="reviews.all")

    class Meta:
        model  = Product
        fields = (
            "id", "name", "slug", "sku", "description", "short_description",
            "base_price", "compare_at_price", "discount_percentage",
            "category", "brand", "images", "colors", "variants", "tags", "attributes",
            "avg_rating", "review_count", "sold_count",
            "meta_title", "meta_description", "reviews", "created_at", "updated_at",
        )
