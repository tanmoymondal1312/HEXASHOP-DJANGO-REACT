"""
Management command: seed_products
Picks 5 images from every subcategory in products_images/ and creates
5 active products per subcategory with realistic names, prices, and variants.

    python manage.py seed_products
    python manage.py seed_products --clear   # wipe seeded products first
"""

import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils.text import slugify

ADJECTIVES = ["Classic", "Premium", "Elegant", "Trendy", "Urban"]

# Structure: parent → { folder, subs: { folder: (display, min, max, markup%) } }
STRUCTURE = {
    "Accessories": {
        "folder": "accessories",
        "subs": {
            "belts":           ("Belts",               15,  55, 30),
            "caps":            ("Caps",                18,  42, 25),
            "gloves":          ("Gloves",              22,  65, 30),
            "hairaccessories": ("Hair Accessories",    10,  38, 20),
            "hats":            ("Hats",                22,  58, 25),
            "jewelry":         ("Jewelry",             25, 145, 40),
            "makeup":          ("Makeup",              15,  82, 30),
            "scarves":         ("Scarves",             20,  72, 25),
            "sunglasses":      ("Sunglasses",          25, 105, 35),
            "watches":         ("Watches",             45, 250, 40),
        },
    },
    "Bags": {
        "folder": "bag",
        "subs": {
            "backpacks": ("Backpacks",    40, 120, 30),
            "clutch":    ("Clutch Bags",  25,  90, 25),
            "handbags":  ("Handbags",     35, 150, 35),
            "satchel":   ("Satchel Bags", 45, 130, 30),
        },
    },
    "Bottoms": {
        "folder": "bottom",
        "subs": {
            "jeans":      ("Jeans",      35,  90, 30),
            "legging":    ("Leggings",   20,  55, 25),
            "pants":      ("Pants",      30,  85, 30),
            "shorts":     ("Shorts",     22,  55, 25),
            "skirts":     ("Skirts",     25,  70, 30),
            "sweatpants": ("Sweatpants", 28,  65, 25),
        },
    },
    "Dresses": {
        "folder": "dress",
        "subs": {
            "casual":   ("Casual Dress",    35,  85, 30),
            "cocktail": ("Cocktail Dress",  55, 155, 35),
            "jumpsuit": ("Jumpsuit",        45, 115, 30),
            "maxi":     ("Maxi Dress",      40,  98, 30),
            "midi":     ("Midi Dress",      38,  92, 28),
            "mini":     ("Mini Dress",      32,  82, 28),
        },
    },
    "Outerwear": {
        "folder": "outerwear",
        "subs": {
            "blazers": ("Blazer",  55, 165, 35),
            "coats":   ("Coat",    80, 255, 40),
            "jackets": ("Jacket",  60, 185, 35),
            "ponchos": ("Poncho",  35,  92, 25),
        },
    },
    "Shoes": {
        "folder": "shoes",
        "subs": {
            "boots":    ("Boots",    62, 205, 35),
            "flats":    ("Flats",    30,  82, 25),
            "heels":    ("Heels",    45, 155, 35),
            "loafers":  ("Loafers",  40, 125, 30),
            "sandals":  ("Sandals",  25,  82, 25),
            "slides":   ("Slides",   20,  62, 20),
            "sneakers": ("Sneakers", 52, 165, 35),
            "wedges":   ("Wedges",   40, 122, 30),
        },
    },
    "Swimwear": {
        "folder": "swimwear",
        "subs": {
            "bottom":   ("Swim Bottom",        18,  48, 20),
            "onepiece": ("One-Piece Swimsuit",  35,  92, 30),
            "top":      ("Swim Top",           18,  48, 20),
            "twopiece": ("Two-Piece Swimsuit",  42, 105, 30),
        },
    },
}

SIZES_MAP = {
    "Shoes":       ["6", "7", "8", "9", "10"],
    "Accessories": ["One Size"],
    "default":     ["XS", "S", "M", "L", "XL"],
}


class Command(BaseCommand):
    help = "Seed 5 products per subcategory from products_images/"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete previously seeded products before re-seeding",
        )

    def handle(self, *args, **options):
        from apps.products.models import (
            Brand,
            Category,
            Product,
            ProductImage,
            ProductVariant,
        )

        src_root = Path(settings.BASE_DIR).parent / "products_images"
        media_products = Path(settings.MEDIA_ROOT) / "products"
        media_products.mkdir(parents=True, exist_ok=True)

        if not src_root.exists():
            self.stderr.write(
                self.style.ERROR(f"products_images folder not found at {src_root}")
            )
            return

        # ── Optional clear ────────────────────────────────────────────────
        if options["clear"]:
            qs = Product.objects.filter(tags__contains=["seeded"])
            count = qs.count()
            qs.delete()
            self.stdout.write(self.style.WARNING(f"Cleared {count} seeded products"))

        # ── Ensure a brand ────────────────────────────────────────────────
        brand, _ = Brand.objects.get_or_create(
            slug="hexashop-brand",
            defaults={"name": "HEXASHOP", "is_active": True},
        )

        sku_base = Product.objects.count() * 10 + 1000
        total_products = 0

        for p_idx, (parent_name, parent_data) in enumerate(STRUCTURE.items()):
            parent_folder = parent_data["folder"]

            parent_cat, _ = Category.objects.get_or_create(
                slug=slugify(parent_name),
                defaults={"name": parent_name, "is_active": True, "sort_order": p_idx},
            )
            self.stdout.write(f"\n📁  {parent_name}")

            for s_idx, (sub_folder, sub_data) in enumerate(parent_data["subs"].items()):
                display_name, price_min, price_max, markup_pct = sub_data
                sub_path = src_root / parent_folder / sub_folder

                if not sub_path.exists():
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠  Not found: {sub_path}")
                    )
                    continue

                imgs = sorted(
                    f
                    for f in sub_path.iterdir()
                    if f.is_file()
                    and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
                )[:5]

                if len(imgs) < 1:
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠  No images in {sub_path}")
                    )
                    continue

                sub_cat, _ = Category.objects.get_or_create(
                    slug=slugify(f"{parent_name}-{display_name}"),
                    defaults={
                        "name": display_name,
                        "parent": parent_cat,
                        "is_active": True,
                        "sort_order": s_idx,
                    },
                )

                if parent_name == "Shoes":
                    sizes = SIZES_MAP["Shoes"]
                elif parent_name == "Accessories":
                    sizes = SIZES_MAP["Accessories"]
                else:
                    sizes = SIZES_MAP["default"]

                step = (price_max - price_min) / max(len(imgs) - 1, 1)

                for idx, (adj, img_path) in enumerate(zip(ADJECTIVES, imgs)):
                    sku_base += 1
                    sku = f"HEX-{sku_base:05d}"

                    if Product.objects.filter(sku=sku).exists():
                        continue

                    product_name = f"{adj} {display_name}"
                    slug_str = f"{slugify(adj)}-{slugify(display_name)}-{sku_base}"

                    base_price = round(price_min + step * idx, 2)
                    compare_price = round(base_price * (1 + markup_pct / 100), 2)

                    # Copy image to media/products/
                    dest_name = f"{sku.lower()}{img_path.suffix}"
                    dest_path = media_products / dest_name
                    shutil.copy2(img_path, dest_path)

                    product = Product.objects.create(
                        name=product_name,
                        slug=slug_str,
                        sku=sku,
                        category=sub_cat,
                        brand=brand,
                        base_price=base_price,
                        compare_at_price=compare_price,
                        short_description=(
                            f"{adj} {display_name.lower()} crafted for everyday style and comfort."
                        ),
                        description=(
                            f"Introducing our {product_name} — a standout piece from the "
                            f"{parent_name} collection. Made with premium materials, "
                            f"it combines style and durability for any occasion."
                        ),
                        status=Product.Status.ACTIVE,
                        is_featured=(idx == 0),
                        sold_count=(idx + 1) * 8,
                        view_count=(idx + 1) * 50,
                        tags=["seeded", parent_name.lower(), sub_folder],
                    )

                    ProductImage.objects.create(
                        product=product,
                        image=f"products/{dest_name}",
                        alt_text=product_name,
                        sort_order=0,
                        is_primary=True,
                    )

                    for size in sizes:
                        var_key = size.replace(" ", "").upper()
                        ProductVariant.objects.create(
                            product=product,
                            sku=f"{sku}-{var_key}",
                            name=size,
                            stock=20,
                            low_stock_threshold=5,
                            attributes={"size": size},
                            is_active=True,
                        )

                    total_products += 1
                    self.stdout.write(f"  ✅  {product_name} ({sku})  ${base_price}")

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉  Done! Created {total_products} products.")
        )
