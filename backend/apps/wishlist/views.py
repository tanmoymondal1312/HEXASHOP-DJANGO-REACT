from django.db.models import Prefetch
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product, ProductImage

from .models import Wishlist, WishlistItem
from .serializers import ToggleWishlistSerializer, WishlistSerializer


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        wl = Wishlist.objects.prefetch_related(
            Prefetch(
                "items__product__images",
                queryset=ProductImage.objects.filter(is_primary=True),
            )
        ).get(pk=wishlist.pk)
        return Response(WishlistSerializer(wl).data)

    def post(self, request):
        """Toggle product in wishlist — add if missing, remove if present."""
        serializer = ToggleWishlistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]

        try:
            product = Product.objects.get(id=product_id, status=Product.Status.ACTIVE)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        if not created:
            item.delete()
            return Response({"in_wishlist": False}, status=status.HTTP_200_OK)

        return Response({"in_wishlist": True}, status=status.HTTP_201_CREATED)


class WishlistCheckView(APIView):
    """Fast endpoint to check if a product is in the user's wishlist."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        in_wl = WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).exists()
        return Response({"in_wishlist": in_wl})
