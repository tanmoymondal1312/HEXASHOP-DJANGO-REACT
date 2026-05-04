import django_filters
from django.db import models
from django.db.models import Q

from .models import Brand, Category, Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")
    category = django_filters.CharFilter(field_name="category__slug")
    brand = django_filters.CharFilter(field_name="brand__slug")
    size = django_filters.CharFilter(method="filter_size")
    color = django_filters.CharFilter(method="filter_color")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")
    on_sale = django_filters.BooleanFilter(method="filter_on_sale")
    rating = django_filters.NumberFilter(field_name="avg_rating", lookup_expr="gte")

    class Meta:
        model = Product
        fields = [
            "min_price", "max_price", "category", "brand",
            "size", "color", "in_stock", "on_sale", "is_featured",
        ]

    def filter_size(self, queryset, name, value):
        return queryset.filter(
            variants__attributes__size__iexact=value,
            variants__is_active=True,
            variants__stock__gt=0,
        ).distinct()

    def filter_color(self, queryset, name, value):
        return queryset.filter(
            variants__attributes__color__iexact=value,
            variants__is_active=True,
        ).distinct()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(variants__stock__gt=0, variants__is_active=True).distinct()
        return queryset

    def filter_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(
                compare_at_price__isnull=False,
                compare_at_price__gt=models.F("base_price"),
            )
        return queryset
