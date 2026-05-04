import uuid

from django.contrib.auth import get_user_model
from django.db import models

from apps.products.models import Product, ProductVariant

User = get_user_model()


class Cart(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name="cart"
    )
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "carts"

    def __str__(self) -> str:
        return f"Cart({self.user or self.session_key})"

    @property
    def total(self):
        return sum(item.line_total for item in self.items.select_related("variant"))

    @property
    def item_count(self) -> int:
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, null=True, blank=True
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cart_items"
        unique_together = ("cart", "variant")

    def __str__(self) -> str:
        return f"{self.quantity}× {self.product.name}"

    @property
    def unit_price(self):
        if self.variant:
            return self.variant.effective_price
        return self.product.base_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity
