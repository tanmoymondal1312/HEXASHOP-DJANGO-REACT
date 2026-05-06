from django import forms

from apps.products.models import Category, Product
from apps.store_settings.models import SiteSettings


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
            "announcement_bar_text": forms.TextInput(attrs={"class": "form-input"}),
            "announcement_bar_link": forms.URLInput(attrs={"class": "form-input"}),
            "announcement_bar_bg_color": forms.TextInput(
                attrs={"class": "form-input", "type": "color"}
            ),
            "announcement_bar_text_color": forms.TextInput(
                attrs={"class": "form-input", "type": "color"}
            ),
        }


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "name",
            "slug",
            "sku",
            "category",
            "brand",
            "status",
            "is_featured",
            "base_price",
            "compare_at_price",
            "short_description",
            "description",
        ]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-input"}),
            "slug": forms.TextInput(attrs={"class": "form-input"}),
            "sku": forms.TextInput(attrs={"class": "form-input"}),
            "category": forms.Select(attrs={"class": "form-select"}),
            "brand": forms.Select(attrs={"class": "form-select"}),
            "status": forms.Select(attrs={"class": "form-select"}),
            "base_price": forms.NumberInput(attrs={"class": "form-input", "step": "0.01"}),
            "compare_at_price": forms.NumberInput(
                attrs={"class": "form-input", "step": "0.01"}
            ),
            "short_description": forms.TextInput(attrs={"class": "form-input"}),
            "description": forms.Textarea(attrs={"class": "form-input", "rows": 5}),
        }


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ["name", "slug", "parent", "description", "is_active", "sort_order"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-input"}),
            "slug": forms.TextInput(attrs={"class": "form-input"}),
            "parent": forms.Select(attrs={"class": "form-select"}),
            "description": forms.Textarea(attrs={"class": "form-input", "rows": 3}),
            "sort_order": forms.NumberInput(attrs={"class": "form-input"}),
        }
