from decimal import Decimal

from rest_framework import serializers

from apps.products.serializers import ProductListSerializer, ProductVariantSerializer

from .models import Cart, CartItem
from .utils import FREE_SHIPPING_THRESHOLD


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    variant_name = serializers.CharField(source="variant.name", read_only=True, default=None)
    variant_attributes = serializers.JSONField(source="variant.attributes", read_only=True, default=None)
    unit_price = serializers.ReadOnlyField()
    line_total = serializers.ReadOnlyField()
    in_stock = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id", "product", "product_name", "product_slug",
            "variant", "variant_name", "variant_attributes",
            "quantity", "unit_price", "line_total", "in_stock", "image",
        )

    def get_in_stock(self, obj) -> bool:
        if obj.variant:
            return obj.variant.stock >= obj.quantity
        return True

    def get_image(self, obj) -> str | None:
        img = obj.product.images.filter(is_primary=True).first()
        if img and img.image:
            return img.image.url
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()
    shipping_cost = serializers.SerializerMethodField()
    free_shipping_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "total", "item_count", "shipping_cost", "free_shipping_remaining")

    def get_shipping_cost(self, obj) -> Decimal:
        return Decimal("0") if obj.total >= FREE_SHIPPING_THRESHOLD else Decimal("10")

    def get_free_shipping_remaining(self, obj) -> Decimal:
        remaining = Decimal(str(FREE_SHIPPING_THRESHOLD)) - obj.total
        return max(remaining, Decimal("0"))


class AddToCartSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)

    def validate(self, attrs):
        from apps.products.models import ProductVariant

        try:
            variant = ProductVariant.objects.select_related("product").get(
                id=attrs["variant_id"], is_active=True
            )
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError("Variant not found.")

        if variant.stock < attrs["quantity"]:
            raise serializers.ValidationError(
                f"Only {variant.stock} item(s) in stock."
            )

        attrs["variant"] = variant
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0, max_value=100)
