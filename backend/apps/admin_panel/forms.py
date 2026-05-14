from django import forms
from django.forms import inlineformset_factory

from apps.products.models import (
    Brand, Category, Product, ProductColor, ProductImage, ProductVariant
)
from apps.store_settings.models import SiteSettings


# ── Common widget helpers ──────────────────────────────────────────────────────

def fi(placeholder="", extra=None):
    attrs = {"class": "form-input"}
    if placeholder:
        attrs["placeholder"] = placeholder
    if extra:
        attrs.update(extra)
    return forms.TextInput(attrs=attrs)


def ni(placeholder="", step="1", extra=None):
    attrs = {"class": "form-input", "step": step}
    if placeholder:
        attrs["placeholder"] = placeholder
    if extra:
        attrs.update(extra)
    return forms.NumberInput(attrs=attrs)


def sel():
    return forms.Select(attrs={"class": "form-select"})


def ta(rows=4, placeholder=""):
    return forms.Textarea(attrs={"class": "form-input", "rows": rows, "placeholder": placeholder})


# ── Sizes / Colors ─────────────────────────────────────────────────────────────

CLOTHING_SIZES = [
    ("", "—"),
    ("XS", "XS"), ("S", "S"), ("M", "M"), ("L", "L"),
    ("XL", "XL"), ("XXL", "XXL"), ("3XL", "3XL"),
]

SHOE_SIZES = [
    ("", "—"),
    ("5", "5"), ("6", "6"), ("7", "7"), ("8", "8"),
    ("9", "9"), ("10", "10"), ("11", "11"), ("12", "12"), ("13", "13"),
]

ALL_SIZES = [("", "—")] + [
    (v, v) for v in [
        "XS", "S", "M", "L", "XL", "XXL", "3XL",
        "5", "6", "7", "8", "9", "10", "11", "12", "13",
        "One Size",
    ]
]


# ── Announcement bar ───────────────────────────────────────────────────────────

class AnnouncementForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = [
            "announcement_bar_text",
            "announcement_bar_is_active",
            "announcement_bar_link",
            "announcement_bar_bg_color",
            "announcement_bar_text_color",
        ]
        widgets = {
            "announcement_bar_text": fi("🔥 Big Sale Live! Get Up to 40% OFF…"),
            "announcement_bar_link": forms.URLInput(attrs={"class": "form-input", "placeholder": "https://…"}),
            "announcement_bar_bg_color": forms.TextInput(attrs={"class": "form-input", "type": "color"}),
            "announcement_bar_text_color": forms.TextInput(attrs={"class": "form-input", "type": "color"}),
        }


# ── Product ────────────────────────────────────────────────────────────────────

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "name", "slug", "sku", "category", "brand",
            "status", "is_featured",
            "base_price", "compare_at_price", "cost_price",
            "short_description", "description",
            "meta_title", "meta_description",
        ]
        widgets = {
            "name":              fi("e.g. Classic White Sneakers"),
            "slug":              fi("auto-filled from name"),
            "sku":               fi("e.g. SNK-WHT-001"),
            "category":          sel(),
            "brand":             sel(),
            "status":            sel(),
            "base_price":        ni("0.00", "0.01"),
            "compare_at_price":  ni("0.00", "0.01"),
            "cost_price":        ni("0.00", "0.01"),
            "short_description": fi("Brief summary shown in listings"),
            "description":       ta(5, "Full product description…"),
            "meta_title":        fi("SEO page title (max 70 chars)"),
            "meta_description":  ta(2, "SEO description (max 160 chars)"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk:
            self.initial.setdefault("status", Product.Status.ACTIVE)
        optional = [
            "brand", "compare_at_price", "cost_price",
            "short_description", "description",
            "meta_title", "meta_description",
        ]
        for f in optional:
            self.fields[f].required = False


# ── Product image ──────────────────────────────────────────────────────────────

class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ["image", "alt_text", "sort_order", "is_primary"]
        widgets = {
            "alt_text":   fi("Alt text (accessibility)"),
            "sort_order": forms.HiddenInput(),
            "is_primary": forms.CheckboxInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for f in ["alt_text", "is_primary", "sort_order"]:
            self.fields[f].required = False
        self.fields["sort_order"].initial = 0


ProductImageFormSet = inlineformset_factory(
    Product, ProductImage,
    form=ProductImageForm,
    extra=3, can_delete=True, max_num=10,
)


# ── Colour + Size helpers (used in views, not Django formsets) ─────────────────

COMMON_SIZES = [
    "XS", "S", "M", "L", "XL", "XXL", "3XL",
    "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
    "28", "30", "32", "34", "36", "38", "40",
    "One Size", "Free Size",
]


# ── Category ───────────────────────────────────────────────────────────────────

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ["name", "slug", "parent", "description", "is_active", "sort_order"]
        widgets = {
            "name":        fi("e.g. Women's Clothing"),
            "slug":        fi("auto-filled from name"),
            "parent":      sel(),
            "description": ta(3, "Optional description"),
            "sort_order":  ni("0"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["parent"].required      = False
        self.fields["description"].required = False
        self.fields["sort_order"].required  = False
        self.fields["sort_order"].initial   = 0
