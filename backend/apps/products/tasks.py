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


@shared_task(queue="inventory", bind=True, max_retries=2)
def compress_product_image(self, image_id: int, target_kb: int = 100) -> str:
    """Compress an uploaded ProductImage down to <= target_kb (JPEG).

    Runs in the background (whenever a worker is free) so uploads are never
    blocked. Storage-agnostic: reads/writes through the field's storage, so it
    works with local FileSystemStorage and Cloudinary alike. Uses queryset
    .update() to persist the new file name WITHOUT firing post_save (no loop).
    """
    from io import BytesIO

    from django.core.files.base import ContentFile
    from PIL import Image as PILImage

    from .models import ProductImage

    try:
        pi = ProductImage.objects.get(pk=image_id)
    except ProductImage.DoesNotExist:
        return "gone"
    if not pi.image:
        return "no-file"

    try:
        original_size = pi.image.size
    except (OSError, ValueError):
        return "unreadable"
    if original_size <= target_kb * 1024:
        return f"already-small ({original_size // 1024}KB)"

    try:
        with pi.image.open("rb") as f:
            img = PILImage.open(f)
            img.load()
    except Exception as exc:  # transient storage error → retry
        raise self.retry(exc=exc, countdown=30 * (self.request.retries + 1))

    # Flatten transparency onto white; JPEG has no alpha channel.
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        background = PILImage.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    max_side = 1200  # plenty for product cards & detail zoom
    if max(img.size) > max_side:
        img.thumbnail((max_side, max_side), PILImage.LANCZOS)

    # Walk quality down; if min quality still too big, shrink 15% and retry.
    buf = BytesIO()
    for _ in range(6):
        for quality in (82, 72, 62, 52, 44, 36):
            buf.seek(0)
            buf.truncate()
            img.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
            if buf.tell() <= target_kb * 1024:
                break
        if buf.tell() <= target_kb * 1024:
            break
        img = img.resize(
            (max(1, int(img.width * 0.85)), max(1, int(img.height * 0.85))),
            PILImage.LANCZOS,
        )

    old_name = pi.image.name
    stem = old_name.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    new_name = pi.image.field.generate_filename(pi, f"{stem}.jpg")
    saved_name = pi.image.storage.save(new_name, ContentFile(buf.getvalue()))

    # .update() bypasses save()/post_save — deliberately, to avoid re-queueing.
    ProductImage.objects.filter(pk=pi.pk).update(image=saved_name)
    if saved_name != old_name:
        try:
            pi.image.storage.delete(old_name)
        except Exception:  # never fail the task over old-file cleanup
            logger.warning("could not delete original %s", old_name)

    new_kb = buf.tell() // 1024
    logger.info(
        "compressed ProductImage %s: %dKB → %dKB (%s)",
        image_id, original_size // 1024, new_kb, saved_name,
    )
    return f"{original_size // 1024}KB -> {new_kb}KB"


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
