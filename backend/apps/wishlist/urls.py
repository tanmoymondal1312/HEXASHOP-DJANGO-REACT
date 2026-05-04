from django.urls import path

from .views import WishlistCheckView, WishlistView

urlpatterns = [
    path("", WishlistView.as_view(), name="wishlist"),
    path("check/<int:product_id>/", WishlistCheckView.as_view(), name="wishlist-check"),
]
