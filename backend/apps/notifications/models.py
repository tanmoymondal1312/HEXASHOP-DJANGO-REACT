from django.contrib.auth import get_user_model
from django.db import models

from apps.products.models import ProductVariant

User = get_user_model()


class StockAlert(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name="stock_alerts"
    )
    email = models.EmailField()
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name="stock_alerts"
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "stock_alerts"
        unique_together = ("email", "variant")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.email} → {self.variant}"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "newsletter_subscribers"

    def __str__(self) -> str:
        return self.email
