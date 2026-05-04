from django.urls import path

from .views import NewsletterSubscribeView, StockAlertView

urlpatterns = [
    path("stock-alert/", StockAlertView.as_view(), name="stock-alert"),
    path("newsletter/", NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
]
