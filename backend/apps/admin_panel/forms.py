from django import forms
from django.forms import inlineformset_factory

from apps.products.models import Brand, Category, Product, ProductImage
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
            "name", "slug", "sku", "category", "brand",
            "status", "is_featured",
            "base_price", "compare_at_price",
            "short_description", "description",
        ]
        # Widgets MUST live in Meta — defining them in __init__ as a local
        # variable has no effect on the form.
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-input"}),
            "slug": forms.TextInput(attrs={"class": "form-input"}),
            "sku": forms.TextInput(attrs={"class": "form-input"}),
            "category": forms.Select(attrs={"class": "form-select"}),
            "brand": forms.Select(attrs={"class": "form-select"}),
            "status": forms.Select(attrs={"class": "form-select"}),
            "base_price": forms.NumberInput(attrs={"class": "form-input", "step": "0.01"}),
            "compare_at_price": forms.NumberInput(attrs={"class": "form-input", "step": "0.01"}),
            "short_description": forms.TextInput(attrs={"class": "form-input"}),
            "description": forms.Textarea(attrs={"class": "form-input", "rows": 5}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Default new products to Active so they show on the store immediately.
        if not self.instance.pk:
            self.initial.setdefault("status", Product.Status.ACTIVE)
        # brand is optional
        self.fields["brand"].required = False
        self.fields["compare_at_price"].required = False
        self.fields["short_description"].required = False
        self.fields["description"].required = False


class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ["image", "alt_text", "sort_order", "is_primary"]
        widgets = {
            "alt_text": forms.TextInput(
                attrs={"class": "form-input", "placeholder": "Alt text (optional)"}
            ),
            # Hidden — always defaults to 0 so it never causes a missing-field error.
            "sort_order": forms.HiddenInput(),
            "is_primary": forms.CheckboxInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["alt_text"].required = False
        self.fields["is_primary"].required = False
        self.fields["sort_order"].required = False
        self.fields["sort_order"].initial = 0


ProductImageFormSet = inlineformset_factory(
    Product,
    ProductImage,
    form=ProductImageForm,
    extra=3,
    can_delete=True,
    max_num=10,
)


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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["parent"].required = False
        self.fields["description"].required = False
        self.fields["sort_order"].required = False
        self.fields["sort_order"].initial = 0
