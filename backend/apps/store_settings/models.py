from django.db import models


class SiteSettings(models.Model):
    """
    Singleton model for store-wide settings.
    Only one row (pk=1) should ever exist.
    """

    # ── Announcement Bar ─────────────────────────────────────────────────────
    announcement_bar_text = models.CharField(
        max_length=500,
        default="🔥 Big Sale Live! Get Up to 40% OFF on All Products.",
        help_text="Text shown in the top announcement bar across the store.",
    )
    announcement_bar_is_active = models.BooleanField(
        default=True,
        help_text="Toggle the announcement bar on/off.",
    )
    announcement_bar_link = models.URLField(
        blank=True,
        help_text="Optional click-through URL for the announcement bar.",
    )
    announcement_bar_bg_color = models.CharField(
        max_length=20,
        default="#111111",
        help_text="Background colour (hex, e.g. #111111).",
    )
    announcement_bar_text_color = models.CharField(
        max_length=20,
        default="#ffffff",
        help_text="Text colour (hex, e.g. #ffffff).",
    )

    # ── Shipping ──────────────────────────────────────────────────────────────
    free_shipping_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=50.00,
        help_text="Minimum order total for free shipping. Set 0 for always-free.",
    )

    # ── SEO ───────────────────────────────────────────────────────────────────
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    meta_keywords = models.TextField(blank=True, help_text="Comma-separated keywords.")

    # ── Maintenance ───────────────────────────────────────────────────────────
    is_maintenance_mode = models.BooleanField(
        default=False,
        help_text="Put the store in maintenance mode (non-staff see a notice).",
    )
    maintenance_message = models.TextField(
        blank=True,
        default="We're currently performing some maintenance. We'll be back shortly!",
    )

    # ── Social Media ──────────────────────────────────────────────────────────
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    tiktok_url = models.URLField(blank=True)

    # ── Hero Section ──────────────────────────────────────────────────────────
    hero_image = models.ImageField(
        upload_to="hero/",
        blank=True,
        null=True,
        help_text="Clothing/product image displayed in the hero circle on the home page.",
    )
    hero_image_alt = models.CharField(
        max_length=200,
        blank=True,
        default="Featured collection",
        help_text="Alt text for the hero image (accessibility).",
    )

    # ── Contact ───────────────────────────────────────────────────────────────
    support_email = models.EmailField(blank=True, default="support@hexashop.com")
    support_phone = models.CharField(max_length=50, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Site Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # prevent accidental deletion

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Banner(models.Model):
    POSITION_CHOICES = [
        ("hero", "Hero Slider"),
        ("promo_top", "Top Promotional Banner"),
        ("promo_mid", "Mid-Page Promotional Banner"),
        ("sidebar", "Sidebar Banner"),
        ("footer", "Footer Banner"),
    ]

    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=500, blank=True)
    image = models.ImageField(
        upload_to="banners/", blank=True, null=True,
        help_text="Upload banner image directly.",
    )
    image_url = models.URLField(
        blank=True,
        help_text="Or paste an external image URL (used if no image is uploaded).",
    )
    # ── Hero-slider–specific extras ───────────────────────────────────────────
    badge_text = models.CharField(
        max_length=100, blank=True, default="",
        help_text='Small badge above the heading (e.g. "New Arrivals 2025").',
    )
    heading_accent = models.CharField(
        max_length=100, blank=True, default="",
        help_text='Colored second part of heading (e.g. "SHOP" in HEXASHOP).',
    )
    description = models.TextField(
        blank=True, default="",
        help_text="Short paragraph shown under the subtitle.",
    )
    accent_color = models.CharField(
        max_length=20, blank=True, default="#1e90ff",
        help_text="Hex accent colour for this slide (e.g. #1e90ff, #f5a623, #a855f7).",
    )

    cta_text = models.CharField(max_length=100, blank=True, verbose_name="Button Text")
    cta_url = models.CharField(max_length=500, blank=True, verbose_name="Button URL")
    secondary_cta_text = models.CharField(
        max_length=100, blank=True, default="", verbose_name="Secondary Button Text",
    )
    secondary_cta_url = models.CharField(
        max_length=500, blank=True, default="", verbose_name="Secondary Button URL",
    )
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default="hero")
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(
        null=True, blank=True, help_text="Leave blank to start immediately."
    )
    valid_to = models.DateTimeField(
        null=True, blank=True, help_text="Leave blank to never expire."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "sort_order", "-created_at"]
        verbose_name = "Banner"
        verbose_name_plural = "Banners"

    def __str__(self):
        return f"{self.title} ({self.get_position_display()})"


class PromoCode(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("PERCENTAGE", "Percentage (%)"),
        ("FIXED", "Fixed Amount ($)"),
        ("FREE_SHIPPING", "Free Shipping"),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(
        max_length=20, choices=DISCOUNT_TYPE_CHOICES, default="PERCENTAGE"
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Percentage value (0–100) or fixed dollar amount.",
    )
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Minimum cart total required to apply this code.",
    )
    max_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum discount cap for percentage codes. Leave blank for no cap.",
    )
    max_uses = models.PositiveIntegerField(
        null=True, blank=True, help_text="Leave blank for unlimited uses."
    )
    uses_count = models.PositiveIntegerField(default=0, editable=False)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Promo Code"
        verbose_name_plural = "Promo Codes"

    def __str__(self):
        return self.code

    @property
    def uses_remaining(self):
        if self.max_uses is None:
            return None  # unlimited
        return max(0, self.max_uses - self.uses_count)


# ══════════════════════════════════════════════════════════════════════════════
#  HERO BUILDER  —  JSON-document–driven hero slides (Shopify/Framer-style)
#
#  A HeroSlide stores its entire visual config as a single versioned JSON
#  `document` (never HTML). React reads the document and renders it. Uploaded
#  images live in HeroAsset (files can't live in JSON) and are referenced from
#  the document by {assetId, url}. See docs of HERO_SLIDE_SCHEMA_VERSION below.
# ══════════════════════════════════════════════════════════════════════════════

HERO_SLIDE_SCHEMA_VERSION = 1


class HeroAsset(models.Model):
    """An uploaded media file used by hero slides. Future-ready: images now,
    video/other later. The slide document references these by id + url."""

    image = models.ImageField(upload_to="hero/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Hero Asset"
        verbose_name_plural = "Hero Assets"

    def __str__(self):
        return f"HeroAsset #{self.pk}"


class HeroSlide(models.Model):
    """One slide of the home-page hero. All styling/content is stored in
    `document` (a versioned JSON schema) so new capabilities (animation, video
    background, per-breakpoint overrides, i18n, scheduling) can be added without
    schema migrations. `title` / `promo` inside the document are native Tiptap
    JSON — the frontend renders them directly, no HTML is ever stored."""

    name = models.CharField(
        max_length=120,
        help_text='Admin-facing label for this slide (e.g. "Ethnic Grace").',
    )
    document = models.JSONField(
        default=dict,
        blank=True,
        help_text="Full versioned slide schema (background, badge, title, "
        "subtitle, description, promo, buttons, image reference).",
    )
    schema_version = models.PositiveSmallIntegerField(
        default=HERO_SLIDE_SCHEMA_VERSION
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    # Scheduling (wired into the UI in a later phase; respected by the public API now)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]
        verbose_name = "Hero Slide"
        verbose_name_plural = "Hero Slides"

    def __str__(self):
        return self.name or f"HeroSlide #{self.pk}"
