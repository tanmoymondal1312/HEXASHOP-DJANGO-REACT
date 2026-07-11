from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify

User = get_user_model()


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "categories"
        verbose_name_plural = "categories"
        ordering = ["sort_order", "name"]
        indexes = [models.Index(fields=["slug"]), models.Index(fields=["parent", "is_active"])]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name

    @property
    def full_path(self) -> str:
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class Brand(TimeStampedModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "brands"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Product(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    sku = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=500, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Original price for discount display"
    )
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)
    attributes = models.JSONField(
        default=dict, blank=True,
        help_text="Flexible product attributes stored as JSONB"
    )
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    # Denormalized for fast queries
    avg_rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    review_count = models.PositiveIntegerField(default=0)
    sold_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["brand", "status"]),
            models.Index(fields=["-avg_rating", "status"]),
            models.Index(fields=["-sold_count", "status"]),
            # GIN index for JSONB — add via migration
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name

    @property
    def discount_percentage(self) -> int | None:
        if self.compare_at_price and self.compare_at_price > self.base_price:
            discount = (self.compare_at_price - self.base_price) / self.compare_at_price * 100
            return int(discount)
        return None


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = "product_images"
        ordering = ["sort_order"]

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product).exclude(pk=self.pk).update(
                is_primary=False
            )
        super().save(*args, **kwargs)


class ProductColor(TimeStampedModel):
    """A named colour option for a product, backed by an optional photo."""
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="colors")
    name       = models.CharField(max_length=60, help_text='e.g. "Sky Blue", "Charcoal"')
    hex_code   = models.CharField(
        max_length=7, blank=True, default="",
        help_text="CSS hex colour e.g. #87CEEB — used as swatch when no image",
    )
    image      = models.ForeignKey(
        "ProductImage", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="color_display",
        help_text="Optional colour-specific product photo",
    )
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table      = "product_colors"
        ordering      = ["sort_order", "id"]
        unique_together = ("product", "name")

    def __str__(self):
        return self.name


class ProductVariant(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    color   = models.ForeignKey(
        ProductColor, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="variants",
    )
    size    = models.CharField(max_length=20, blank=True, default="")
    sku     = models.CharField(max_length=100, unique=True)
    name    = models.CharField(max_length=200, blank=True)
    price   = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Leave blank to use product base price",
    )
    compare_at_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    attributes = models.JSONField(
        default=dict,
        help_text='e.g. {"size": "M", "color": "Black"}'
    )
    image = models.ForeignKey(
        ProductImage, on_delete=models.SET_NULL, null=True, blank=True, related_name="variants"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_variants"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["product", "is_active"]),
            models.Index(fields=["sku"]),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} – {self.name}"

    @property
    def effective_price(self):
        return self.price if self.price is not None else self.product.base_price

    @property
    def is_in_stock(self) -> bool:
        return self.stock > 0

    @property
    def is_low_stock(self) -> bool:
        return 0 < self.stock <= self.low_stock_threshold


class Review(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="reviews")
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    helpful_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "reviews"
        unique_together = ("product", "user")
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["product", "-created_at"])]

    def __str__(self) -> str:
        return f"{self.user} rated {self.product} {self.rating}★"


# ── Signals ───────────────────────────────────────────────────────────────────
from django.db.models.signals import post_save  # noqa: E402
from django.dispatch import receiver  # noqa: E402
from django.db import transaction  # noqa: E402


@receiver(post_save, sender=ProductImage)
def queue_image_compression(sender, instance, **kwargs):
    """Whenever a product image is uploaded/replaced, compress it to <100KB in
    the background (Celery inventory queue) — the request is never blocked, and
    a broker outage must never break the upload itself."""

    def enqueue():
        try:
            from .tasks import compress_product_image
            compress_product_image.delay(instance.pk)
        except Exception:
            import logging
            logging.getLogger(__name__).warning(
                "could not queue compression for ProductImage %s", instance.pk
            )

    transaction.on_commit(enqueue)
