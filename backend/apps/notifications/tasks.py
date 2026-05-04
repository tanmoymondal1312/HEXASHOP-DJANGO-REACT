import logging
from datetime import datetime

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(queue="emails", bind=True, max_retries=3, default_retry_delay=120)
def send_back_in_stock_alert(self, variant_id: int) -> None:
    from .models import StockAlert

    alerts = StockAlert.objects.filter(
        variant_id=variant_id, status=StockAlert.Status.PENDING
    ).select_related("variant__product")

    if not alerts.exists():
        return

    variant = alerts.first().variant
    product = variant.product
    product_url = f"{settings.FRONTEND_URL}/products/{product.slug}/"

    for alert in alerts:
        try:
            send_mail(
                subject=f"Back in Stock: {product.name}",
                message=f"Good news! {product.name} ({variant.name}) is back in stock. Shop now: {product_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[alert.email],
                fail_silently=False,
            )
            alert.status = StockAlert.Status.SENT
            alert.sent_at = datetime.utcnow()
            alert.save()
            logger.info("Stock alert sent to %s for variant %s", alert.email, variant_id)
        except Exception as exc:
            logger.error("Failed to send stock alert to %s: %s", alert.email, exc)
            raise self.retry(exc=exc)


@shared_task(queue="emails", bind=True, max_retries=3, default_retry_delay=60)
def send_newsletter_email(self, subscriber_email: str, subject: str, body_html: str) -> None:
    try:
        send_mail(
            subject=subject,
            message="",
            html_message=body_html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[subscriber_email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(queue="inventory")
def check_low_stock_and_notify(threshold: int = 5) -> None:
    from apps.products.models import ProductVariant

    low_stock = ProductVariant.objects.filter(
        stock__gt=0, stock__lte=threshold, is_active=True
    ).select_related("product")

    for variant in low_stock:
        logger.warning(
            "Low stock alert: %s – %s has %d units left",
            variant.product.name, variant.name, variant.stock,
        )
