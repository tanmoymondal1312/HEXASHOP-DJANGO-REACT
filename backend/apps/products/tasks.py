import logging

import cloudinary
import cloudinary.uploader
from celery import shared_task
from django.core.cache import cache

logger = logging.getLogger(__name__)


@shared_task(queue="inventory", bind=True, max_retries=3)
def process_product_images(self, product_id: int) -> None:
    from .models import Product, ProductImage

    try:
        product = Product.objects.get(pk=product_id)
        for image in product.images.all():
            if image.image:
                cloudinary.uploader.explicit(
                    image.image.public_id,
                    type="upload",
                    eager=[
                        {"width": 800, "height": 800, "crop": "fill", "format": "webp"},
                        {"width": 400, "height": 400, "crop": "fill", "format": "webp"},
                        {"width": 100, "height": 100, "crop": "fill", "format": "webp"},
                    ],
                )
        cache.delete(f"product_detail:{product.slug}")
        logger.info("Processed images for product %s", product_id)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(queue="inventory")
def bulk_update_inventory(updates: list[dict]) -> None:
    from .models import ProductVariant

    for update in updates:
        ProductVariant.objects.filter(sku=update["sku"]).update(stock=update["stock"])
    logger.info("Bulk inventory update: %d variants", len(updates))


@shared_task(queue="reporting")
def generate_sitemap() -> None:
    from django.test import RequestFactory
    from django.contrib.sitemaps.views import sitemap

    logger.info("Sitemap generation triggered")
