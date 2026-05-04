import functools
import hashlib
import json
from typing import Any, Callable

from django.core.cache import cache


PRODUCT_DETAIL_TTL = 3600       # 1 hour
CATEGORY_TREE_TTL = 21600       # 6 hours
SEARCH_SUGGEST_TTL = 300        # 5 minutes
RECENTLY_VIEWED_TTL = 86400     # 24 hours
CART_GUEST_TTL = 604800         # 7 days


def make_cache_key(*args: Any, prefix: str = "hex") -> str:
    raw = json.dumps(args, sort_keys=True, default=str)
    digest = hashlib.md5(raw.encode()).hexdigest()
    return f"{prefix}:{digest}"


def cache_response(ttl: int, prefix: str = "view"):
    """Decorator that caches a view method's return value."""

    def decorator(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = make_cache_key(fn.__qualname__, args[1:], kwargs, prefix=prefix)
            cached = cache.get(key)
            if cached is not None:
                return cached
            result = fn(*args, **kwargs)
            cache.set(key, result, ttl)
            return result

        return wrapper

    return decorator


def invalidate_product_cache(product_id: int) -> None:
    cache.delete_pattern(f"hexashop:product:{product_id}:*")


def get_recently_viewed(user_key: str) -> list[int]:
    return cache.get(f"recently_viewed:{user_key}", [])


def add_recently_viewed(user_key: str, product_id: int, max_items: int = 20) -> None:
    viewed: list[int] = cache.get(f"recently_viewed:{user_key}", [])
    if product_id in viewed:
        viewed.remove(product_id)
    viewed.insert(0, product_id)
    cache.set(f"recently_viewed:{user_key}", viewed[:max_items], RECENTLY_VIEWED_TTL)
