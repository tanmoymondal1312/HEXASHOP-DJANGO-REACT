import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.products.models import Brand, Category, Product, ProductVariant


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def category(db):
    return Category.objects.create(name="Hoodies", slug="hoodies", is_active=True)


@pytest.fixture
def brand(db):
    return Brand.objects.create(name="Hexa Brand", slug="hexa-brand", is_active=True)


@pytest.fixture
def product(db, category, brand):
    p = Product.objects.create(
        name="HEX Hoodie",
        slug="hex-hoodie",
        sku="HEX-001",
        category=category,
        brand=brand,
        base_price="49.99",
        status=Product.Status.ACTIVE,
    )
    ProductVariant.objects.create(
        product=p,
        sku="HEX-001-M-BLK",
        name="M / Black",
        stock=10,
        attributes={"size": "M", "color": "Black"},
    )
    return p


@pytest.mark.django_db
class TestProductList:
    def test_list_active_products(self, api_client, product):
        url = reverse("product-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_filter_by_category(self, api_client, product, category):
        url = reverse("product-list")
        response = api_client.get(url, {"category": category.slug})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_filter_by_price(self, api_client, product):
        url = reverse("product-list")
        response = api_client.get(url, {"min_price": 100})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_search(self, api_client, product):
        url = reverse("product-list")
        response = api_client.get(url, {"search": "hoodie"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_draft_products_hidden(self, api_client, category):
        Product.objects.create(
            name="Draft Product",
            slug="draft-product",
            sku="DRAFT-001",
            category=category,
            base_price="10.00",
            status=Product.Status.DRAFT,
        )
        url = reverse("product-list")
        response = api_client.get(url)
        assert all(p["name"] != "Draft Product" for p in response.data["results"])


@pytest.mark.django_db
class TestProductDetail:
    def test_retrieve_by_slug(self, api_client, product):
        url = reverse("product-detail", kwargs={"pk": product.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["slug"] == product.slug

    def test_404_for_nonexistent(self, api_client):
        url = reverse("product-detail", kwargs={"pk": "nonexistent-slug"})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestCategories:
    def test_category_tree(self, api_client, category):
        url = reverse("category-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        names = [c["name"] for c in response.data]
        assert "Hoodies" in names
