import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.cart.models import Cart, CartItem
from apps.products.models import Category, Product, ProductVariant

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def variant(db):
    category = Category.objects.create(name="Test", slug="test", is_active=True)
    product = Product.objects.create(
        name="Test Product",
        slug="test-product",
        sku="TEST-001",
        category=category,
        base_price="29.99",
        status=Product.Status.ACTIVE,
    )
    return ProductVariant.objects.create(
        product=product,
        sku="TEST-001-M",
        name="M",
        stock=5,
        attributes={"size": "M"},
    )


@pytest.mark.django_db
class TestCart:
    def test_add_to_cart_authenticated(self, auth_client, variant):
        url = reverse("cart")
        response = auth_client.post(url, {"variant_id": variant.id, "quantity": 2})
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["item_count"] == 2

    def test_add_to_cart_exceeds_stock(self, auth_client, variant):
        url = reverse("cart")
        response = auth_client.post(url, {"variant_id": variant.id, "quantity": 100})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_remove_item(self, auth_client, user, variant):
        cart = Cart.objects.create(user=user)
        item = CartItem.objects.create(
            cart=cart, product=variant.product, variant=variant, quantity=1
        )
        url = reverse("cart-item", kwargs={"item_id": item.id})
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_200_OK
        assert not CartItem.objects.filter(id=item.id).exists()

    def test_update_quantity(self, auth_client, user, variant):
        cart = Cart.objects.create(user=user)
        item = CartItem.objects.create(
            cart=cart, product=variant.product, variant=variant, quantity=1
        )
        url = reverse("cart-item", kwargs={"item_id": item.id})
        response = auth_client.patch(url, {"quantity": 3})
        assert response.status_code == status.HTTP_200_OK
        item.refresh_from_db()
        assert item.quantity == 3
