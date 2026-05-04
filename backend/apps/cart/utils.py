import json
import logging

from django.core.cache import cache

from core.cache import CART_GUEST_TTL

logger = logging.getLogger(__name__)

FREE_SHIPPING_THRESHOLD = 75  # USD


def get_guest_cart_key(session_key: str) -> str:
    return f"guest_cart:{session_key}"


def get_guest_cart(session_key: str) -> list[dict]:
    raw = cache.get(get_guest_cart_key(session_key))
    return raw if raw is not None else []


def set_guest_cart(session_key: str, items: list[dict]) -> None:
    cache.set(get_guest_cart_key(session_key), items, CART_GUEST_TTL)


def merge_guest_cart(session_key: str, user) -> None:
    from .models import Cart, CartItem
    from apps.products.models import ProductVariant

    guest_items = get_guest_cart(session_key)
    if not guest_items:
        return

    cart, _ = Cart.objects.get_or_create(user=user)
    for item in guest_items:
        try:
            variant = ProductVariant.objects.select_related("product").get(
                id=item["variant_id"]
            )
            existing = CartItem.objects.filter(cart=cart, variant=variant).first()
            if existing:
                existing.quantity = min(existing.quantity + item["quantity"], variant.stock)
                existing.save()
            else:
                CartItem.objects.create(
                    cart=cart,
                    product=variant.product,
                    variant=variant,
                    quantity=min(item["quantity"], variant.stock),
                )
        except Exception as exc:
            logger.warning("Could not merge cart item %s: %s", item, exc)

    cache.delete(get_guest_cart_key(session_key))
    logger.info("Merged guest cart for user %s", user.email)
