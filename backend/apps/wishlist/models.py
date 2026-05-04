from django.contrib.auth import get_user_model
from django.db import models

from apps.products.models import Product, ProductVariant

User = get_user_model()


class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wishlist")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlists"

    def __str__(self) -> str:
        return f"Wishlist of {self.user.email}"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlist_items"
        unique_together = ("wishlist", "product")
        ordering = ["-added_at"]

    def __str__(self) -> str:
        return f"{self.product.name} in {self.wishlist}"
