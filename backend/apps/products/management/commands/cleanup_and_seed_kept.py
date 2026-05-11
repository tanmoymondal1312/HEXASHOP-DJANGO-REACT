"""
1. Deletes orphaned media/products/ files (images of deleted products).
   Keeps: any file referenced in the DB  +  the 9 fashion webp files  +  the keep-this files.
2. Creates 6 new products from the keep-this images.

Usage:
    python manage.py cleanup_and_seed_kept
    python manage.py cleanup_and_seed_kept --dry-run   # preview only, no changes
"""

import os
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from apps.products.models import Category, Product, ProductImage, ProductVariant

MEDIA_PRODUCTS = Path(settings.MEDIA_ROOT) / "products"

# Files we always protect (the 9 fashion products + keep-this images)
ALWAYS_KEEP = {
    # 9 fashion product images
    "Regular_Fit_Bengal_Stripe_Templeton_Formal_Shirt.webp",
    "Regular_Fit_Bengal_Stripe_Templeton_Formal_Shirt_Blue.webp",
    "Stylist_Watch_For_Men.webp",
    "Womens_Saree.webp",
    "Womens_Saree-White.webp",
    "Chic_Shoulder_Bags_for_Women_in_Bangladesh__Patchee_BD.webp",
    "Chic_Shoulder_Bags_for_Women_in_Bangladesh__Patchee_BD_Brown.webp",
    "Wide-leg_High-Waist_Denim.webp",
    "Wide-leg_High-Waist_Denim_Black.webp",
    # keep-this images
    "keep-this.jpg",
    "keep-this1.jpg",
    "keep-this2.jpg",
    "keep-this-6.jpg",
    "keep this 7.jpg",
    "keep-this89.jpg",
}

# 6 products to create from keep-this images
KEEP_PRODUCTS = [
    {
        "sku":           "SHOE-KT001",
        "name":          "Black Chunky Knit Sneakers",
        "slug":          "black-chunky-knit-sneakers",
        "category_slug": "sneakers-loafers",
        "price":         "89.99",
        "compare_price": "149.99",
        "image":         "keep-this.jpg",
        "color":         "Black/Red",
        "size":          "7",
        "stock":         20,
        "is_featured":   True,
        "short_desc":    "Bold black chunky knit sneakers with signature red sole and colorful lace detail.",
        "description":   (
            "Make a statement with these Black Chunky Knit Sneakers featuring a luxurious knit upper, "
            "bold chunky sole in white and red, and multicolor lace detail. Inspired by high-fashion "
            "footwear, these sneakers combine comfort with eye-catching design. Perfect for streetwear "
            "or elevating a casual outfit."
        ),
        "tags": ["sneakers", "footwear", "chunky", "black", "luxury"],
    },
    {
        "sku":           "SHOE-KT002",
        "name":          "Velvet Mary Jane Ballet Flats",
        "slug":          "velvet-mary-jane-ballet-flats",
        "category_slug": "flats",
        "price":         "59.99",
        "compare_price": "95.00",
        "image":         "keep-this1.jpg",
        "color":         "Black",
        "size":          "7",
        "stock":         28,
        "is_featured":   True,
        "short_desc":    "Elegant black velvet Mary Jane ballet flats with silver buckle strap.",
        "description":   (
            "Timeless elegance meets everyday comfort in these Black Velvet Mary Jane Ballet Flats. "
            "Featuring a classic Mary Jane strap with a polished silver buckle, soft velvet upper, "
            "and cushioned insole, these flats are perfect for both formal occasions and chic casual looks."
        ),
        "tags": ["flats", "ballet", "mary jane", "velvet", "black", "womens"],
    },
    {
        "sku":           "SHOE-KT003",
        "name":          "Studded Pointed-Toe Ballet Flats",
        "slug":          "studded-pointed-toe-ballet-flats",
        "category_slug": "flats",
        "price":         "69.99",
        "compare_price": "115.00",
        "image":         "keep-this2.jpg",
        "color":         "Nude",
        "size":          "7",
        "stock":         22,
        "is_featured":   False,
        "short_desc":    "Chic nude leather ballet flats with gold pyramid stud trim.",
        "description":   (
            "Inspired by iconic runway designs, these Studded Pointed-Toe Ballet Flats feature a "
            "luxurious nude leather upper, pointed toe, and gold pyramid stud detailing along the collar. "
            "The flat silhouette and premium construction make them the ultimate wardrobe staple for "
            "fashion-forward women."
        ),
        "tags": ["flats", "studded", "nude", "ballet", "pointed toe", "womens"],
    },
    {
        "sku":           "JACK-KT006",
        "name":          "Double-Breasted Wool Blazer",
        "slug":          "double-breasted-wool-blazer",
        "category_slug": "womens-outerwear",
        "price":         "79.99",
        "compare_price": "139.99",
        "image":         "keep-this-6.jpg",
        "color":         "Black",
        "size":          "M",
        "stock":         15,
        "is_featured":   True,
        "short_desc":    "Structured black double-breasted wool blazer with sharp peaked lapels.",
        "description":   (
            "Command attention in this structured Double-Breasted Wool Blazer. Featuring sharp peaked "
            "lapels, six-button front, flap pockets, and a tailored silhouette, this blazer is a "
            "masterpiece of minimalist elegance. Crafted from fine wool, it drapes beautifully and "
            "transitions seamlessly from the boardroom to evening events."
        ),
        "tags": ["blazer", "jacket", "womens", "formal", "black", "wool"],
    },
    {
        "sku":           "SHOE-KT007",
        "name":          "Oversized White Leather Sneakers",
        "slug":          "oversized-white-leather-sneakers",
        "category_slug": "sneakers-loafers",
        "price":         "99.99",
        "compare_price": "169.99",
        "image":         "keep this 7.jpg",
        "color":         "White/Navy",
        "size":          "8",
        "stock":         18,
        "is_featured":   True,
        "short_desc":    "Oversized white leather sneakers with navy blue suede heel counter.",
        "description":   (
            "Channel high-fashion street style with these Oversized White Leather Sneakers. Featuring "
            "a chunky exaggerated platform sole, premium white leather upper, navy blue suede heel "
            "counter, and perforated detailing, these sneakers have become a modern wardrobe icon. "
            "Pair with anything for an effortlessly elevated look."
        ),
        "tags": ["sneakers", "white", "oversized", "platform", "leather", "luxury"],
    },
    {
        "sku":           "DRES-KT089",
        "name":          "Belted Monogram Print Midi Dress",
        "slug":          "belted-monogram-print-midi-dress",
        "category_slug": "dresses",
        "price":         "64.99",
        "compare_price": "109.99",
        "image":         "keep-this89.jpg",
        "color":         "Black/White",
        "size":          "M",
        "stock":         25,
        "is_featured":   False,
        "short_desc":    "Elegant belted midi dress with diagonal monogram stripe print.",
        "description":   (
            "Make a sophisticated statement in this Belted Monogram Print Midi Dress. The diagonal "
            "stripe and floral logo print adds a luxurious touch, while the V-neckline and blouson "
            "sleeves create a flattering silhouette. The leather belt cinches the waist beautifully, "
            "completing the polished, put-together look."
        ),
        "tags": ["dress", "midi", "belted", "monogram", "black", "womens"],
    },
]


class Command(BaseCommand):
    help = "Clean orphaned media files and seed 6 products from keep-this images"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print what would happen without making any changes",
        )

    def handle(self, *args, **options):
        dry = options["dry_run"]
        if dry:
            self.stdout.write(self.style.WARNING("=== DRY RUN — no changes will be made ===\n"))

        # ── Step 1: Collect filenames referenced in DB ──────────────────────
        db_files = set()
        for pi in ProductImage.objects.all():
            if pi.image:
                db_files.add(Path(pi.image.name).name)

        protected = ALWAYS_KEEP | db_files

        # ── Step 2: Delete orphaned files ────────────────────────────────────
        self.stdout.write(self.style.HTTP_INFO("\n── Cleaning orphaned media files ──"))
        deleted_count = 0

        if MEDIA_PRODUCTS.exists():
            for f in sorted(MEDIA_PRODUCTS.iterdir()):
                if f.is_file() and f.name not in protected:
                    if dry:
                        self.stdout.write(f"  [DRY] would delete: {f.name}")
                    else:
                        f.unlink()
                        self.stdout.write(self.style.WARNING(f"  deleted: {f.name}"))
                    deleted_count += 1

        if deleted_count == 0:
            self.stdout.write("  Nothing to delete.")
        else:
            verb = "Would delete" if dry else "Deleted"
            self.stdout.write(self.style.SUCCESS(f"  {verb} {deleted_count} orphaned file(s)."))

        # ── Step 3: Create 6 products from keep-this images ─────────────────
        self.stdout.write(self.style.HTTP_INFO("\n── Creating products from keep-this images ──"))
        created = skipped = 0

        for data in KEEP_PRODUCTS:
            img_path = MEDIA_PRODUCTS / data["image"]

            if not img_path.exists():
                self.stdout.write(self.style.WARNING(f"  Image missing, skipping: {data['image']}"))
                skipped += 1
                continue

            if Product.objects.filter(sku=data["sku"]).exists():
                self.stdout.write(f"  Already exists: {data['sku']} — skip")
                skipped += 1
                continue

            try:
                category = Category.objects.get(slug=data["category_slug"])
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"  Category '{data['category_slug']}' not found for {data['sku']}, skipping."
                ))
                skipped += 1
                continue

            if dry:
                self.stdout.write(f"  [DRY] would create: {data['sku']}  {data['name']}")
                created += 1
                continue

            product = Product.objects.create(
                sku=data["sku"],
                name=data["name"],
                slug=data["slug"],
                category=category,
                brand=None,
                status="active",
                base_price=data["price"],
                compare_at_price=data["compare_price"],
                short_description=data["short_desc"],
                description=data["description"],
                tags=data["tags"],
                is_featured=data["is_featured"],
                attributes={"color": data["color"], "size": data["size"]},
            )

            ProductVariant.objects.create(
                product=product,
                sku=f"{data['sku']}-V1",
                name=f"{data['color']} / {data['size']}",
                price=data["price"],
                stock=data["stock"],
                low_stock_threshold=5,
                attributes={"color": data["color"], "size": data["size"]},
                is_active=True,
            )

            with open(img_path, "rb") as fh:
                django_file = File(fh, name=img_path.name)
                ProductImage.objects.create(
                    product=product,
                    image=django_file,
                    alt_text=data["name"],
                    is_primary=True,
                    sort_order=0,
                )

            created += 1
            self.stdout.write(self.style.SUCCESS(f"  ✓ {data['sku']}  {data['name']}"))

        # ── Step 4: Clear cache ──────────────────────────────────────────────
        if not dry:
            from django.core.cache import cache
            cache.delete_many(["featured_products", "viral_products", "category_tree"])
            self.stdout.write(self.style.HTTP_INFO("\n── Cache cleared ──"))

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {created} product(s) created, {skipped} skipped, "
            f"{deleted_count} file(s) {'would be ' if dry else ''}deleted."
        ))
