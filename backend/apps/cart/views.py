from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)
from .utils import get_guest_cart, set_guest_cart


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def _get_or_create_cart(self, request) -> Cart | None:
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart
        return None

    def get(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart_qs = Cart.objects.prefetch_related(
                "items__product__images", "items__variant"
            ).get(pk=cart.pk)
            return Response(CartSerializer(cart_qs).data)

        # Guest cart from Redis
        session_key = request.session.session_key or request.query_params.get("session_key")
        if not session_key:
            return Response({"items": [], "total": "0.00", "item_count": 0})

        items = get_guest_cart(session_key)
        return Response({"session_key": session_key, "items": items, "item_count": len(items)})

    def post(self, request):
        """Add item to cart."""
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        variant = serializer.validated_data["variant"]
        quantity = serializer.validated_data["quantity"]

        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            item, created = CartItem.objects.get_or_create(
                cart=cart, variant=variant,
                defaults={"product": variant.product, "quantity": 0},
            )
            new_qty = item.quantity + quantity
            if new_qty > variant.stock:
                return Response(
                    {"detail": f"Cannot add {quantity} — only {variant.stock} in stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_qty
            item.save()
            cart_qs = Cart.objects.prefetch_related("items__product__images", "items__variant").get(pk=cart.pk)
            return Response(CartSerializer(cart_qs).data, status=status.HTTP_201_CREATED)

        # Guest cart
        session_key = request.data.get("session_key")
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        items = get_guest_cart(session_key)
        for item in items:
            if item["variant_id"] == variant.id:
                item["quantity"] = min(item["quantity"] + quantity, variant.stock)
                break
        else:
            items.append({
                "variant_id": variant.id,
                "product_id": variant.product.id,
                "product_name": variant.product.name,
                "variant_name": variant.name,
                "attributes": variant.attributes,
                "quantity": quantity,
                "unit_price": str(variant.effective_price),
            })
        set_guest_cart(session_key, items)
        return Response(
            {"session_key": session_key, "items": items, "item_count": len(items)},
            status=status.HTTP_201_CREATED,
        )


class CartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data["quantity"]

        if request.user.is_authenticated:
            try:
                item = CartItem.objects.select_related("variant").get(
                    id=item_id, cart__user=request.user
                )
            except CartItem.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if quantity == 0:
                item.delete()
            else:
                if quantity > item.variant.stock:
                    return Response(
                        {"detail": f"Only {item.variant.stock} in stock."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                item.quantity = quantity
                item.save()

            cart = Cart.objects.prefetch_related("items__product__images", "items__variant").get(
                user=request.user
            )
            return Response(CartSerializer(cart).data)

        return Response({"detail": "Guest cart updates not supported via ID."})

    def delete(self, request, item_id):
        if request.user.is_authenticated:
            CartItem.objects.filter(id=item_id, cart__user=request.user).delete()
            cart = Cart.objects.prefetch_related("items__product__images", "items__variant").get(
                user=request.user
            )
            return Response(CartSerializer(cart).data)
        return Response(status=status.HTTP_204_NO_CONTENT)
