from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NewsletterSubscriber, StockAlert
from .tasks import send_back_in_stock_alert


class StockAlertView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        variant_id = request.data.get("variant_id")

        if not email or not variant_id:
            return Response(
                {"detail": "email and variant_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from apps.products.models import ProductVariant

        try:
            variant = ProductVariant.objects.get(id=variant_id, is_active=True)
        except ProductVariant.DoesNotExist:
            return Response({"detail": "Variant not found."}, status=status.HTTP_404_NOT_FOUND)

        if variant.stock > 0:
            return Response({"detail": "Item is already in stock."}, status=status.HTTP_400_BAD_REQUEST)

        alert, created = StockAlert.objects.get_or_create(
            email=email,
            variant=variant,
            defaults={"user": request.user if request.user.is_authenticated else None},
        )

        if not created:
            return Response({"detail": "Alert already registered."})

        return Response(
            {"detail": "You'll be notified when this item is back in stock."},
            status=status.HTTP_201_CREATED,
        )


class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if not created and subscriber.is_active:
            return Response({"detail": "Already subscribed."})

        subscriber.is_active = True
        subscriber.save()
        return Response(
            {"detail": "Successfully subscribed to our newsletter!"},
            status=status.HTTP_201_CREATED,
        )
