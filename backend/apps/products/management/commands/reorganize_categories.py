"""
Management command: reorganize_categories

Replaces the messy 66-category tree (duplicates, old placeholders, over-granular
sub-categories) with a clean 5-parent × 20-subcategory structure, then re-links
all seeded products using their tags.

Usage:
    python manage.py reorganize_categories
    python manage.py reorganize_categories --dry-run   # preview only
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify


# ── New clean category tree ────────────────────────────────────────────────────

NEW_TREE = {
    "Women's Clothing": {
        "sort_order": 0,
        "slug": "womens-clothing",
        "subs": [
            ("Dresses",          "dresses",          0),
            ("Tops & Shirts",    "womens-tops",      1),
            ("Bottoms",          "womens-bottoms",   2),
            ("Outerwear",        "womens-outerwear", 3),
            ("Swimwear",         "swimwear",         4),
        ],
    },
    "Men's Clothing": {
        "sort_order": 1,
        "slug": "mens-clothing",
        "subs": [
            ("Shirts & Tops",        "mens-tops",      0),
            ("Pants & Jeans",        "mens-bottoms",   1),
            ("Jackets & Outerwear",  "mens-outerwear", 2),
        ],
    },
    "Footwear": {
        "sort_order": 2,
        "slug": "footwear",
        "subs": [
            ("Heels & Wedges",    "heels-wedges",      0),
            ("Sneakers & Loafers","sneakers-loafers",  1),
            ("Boots",             "boots",             2),
            ("Sandals & Slides",  "sandals-slides",    3),
            ("Flats",             "flats",             4),
        ],
    },
    "Bags": {
        "sort_order": 3,
        "slug": "bags",
        "subs": [
            ("Handbags",          "handbags",    0),
            ("Backpacks",         "backpacks",   1),
            ("Clutches",          "clutches",    2),
        ],
    },
    "Accessories": {
        "sort_order": 4,
        "slug": "accessories",
        "subs": [
            ("Jewelry & Watches", "jewelry-watches", 0),
            ("Sunglasses",        "sunglasses",      1),
            ("Hats & Caps",       "hats-caps",       2),
            ("Belts & Scarves",   "belts-scarves",   3),
            ("Beauty & More",     "beauty-more",     4),
        ],
    },
}

# ── Mapping: (old_parent_tag, old_sub_folder) → new_sub_slug ──────────────────
# old_parent_tag = second element of product.tags  (e.g. "swimwear", "shoes")
# old_sub_folder = third element of product.tags   (e.g. "twopiece", "heels")

TAG_TO_NEW_SUB = {
    # ── Accessories ─────────────────────────────────────────────────────────
    ("accessories", "belts"):           "belts-scarves",
    ("accessories", "caps"):            "hats-caps",
    ("accessories", "gloves"):          "beauty-more",
    ("accessories", "hairaccessories"): "beauty-more",
    ("accessories", "hats"):            "hats-caps",
    ("accessories", "jewelry"):         "jewelry-watches",
    ("accessories", "makeup"):          "beauty-more",
    ("accessories", "scarves"):         "belts-scarves",
    ("accessories", "sunglasses"):      "sunglasses",
    ("accessories", "watches"):         "jewelry-watches",
    # ── Bags ─────────────────────────────────────────────────────────────────
    ("bags", "backpacks"):  "backpacks",
    ("bags", "clutch"):     "clutches",
    ("bags", "handbags"):   "handbags",
    ("bags", "satchel"):    "backpacks",
    # ── Bottoms → mostly Women's ─────────────────────────────────────────────
    ("bottoms", "jeans"):      "womens-bottoms",
    ("bottoms", "legging"):    "womens-bottoms",
    ("bottoms", "pants"):      "womens-bottoms",
    ("bottoms", "shorts"):     "womens-bottoms",
    ("bottoms", "skirts"):     "womens-bottoms",
    ("bottoms", "sweatpants"): "mens-bottoms",
    # ── Dresses ──────────────────────────────────────────────────────────────
    ("dresses", "casual"):   "dresses",
    ("dresses", "cocktail"): "dresses",
    ("dresses", "jumpsuit"): "dresses",
    ("dresses", "maxi"):     "dresses",
    ("dresses", "midi"):     "dresses",
    ("dresses", "mini"):     "dresses",
    # ── Outerwear ────────────────────────────────────────────────────────────
    ("outerwear", "blazers"): "womens-outerwear",
    ("outerwear", "coats"):   "womens-outerwear",
    ("outerwear", "jackets"): "mens-outerwear",
    ("outerwear", "ponchos"): "womens-outerwear",
    # ── Shoes ────────────────────────────────────────────────────────────────
    ("shoes", "boots"):    "boots",
    ("shoes", "flats"):    "flats",
    ("shoes", "heels"):    "heels-wedges",
    ("shoes", "loafers"):  "sneakers-loafers",
    ("shoes", "sandals"):  "sandals-slides",
    ("shoes", "slides"):   "sandals-slides",
    ("shoes", "sneakers"): "sneakers-loafers",
    ("shoes", "wedges"):   "heels-wedges",
    # ── Swimwear ─────────────────────────────────────────────────────────────
    ("swimwear", "bottom"):    "swimwear",
    ("swimwear", "onepiece"):  "swimwear",
    ("swimwear", "top"):       "swimwear",
    ("swimwear", "twopiece"):  "swimwear",
}


class Command(BaseCommand):
    help = "Rebuild category tree and re-link seeded products."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true",
                            help="Print what would happen without writing to DB.")

    def handle(self, *args, **options):
        from apps.products.models import Category, Product

        dry = options["dry_run"]
        if dry:
            self.stdout.write(self.style.WARNING("DRY RUN — no changes written\n"))

        with transaction.atomic():
            # ── 1. Build new category objects ────────────────────────────────
            new_sub_by_slug: dict[str, Category] = {}

            self.stdout.write("Creating new category tree …")
            for parent_name, cfg in NEW_TREE.items():
                parent_slug = cfg["slug"]

                if not dry:
                    parent, _ = Category.objects.update_or_create(
                        slug=parent_slug,
                        defaults={
                            "name": parent_name,
                            "parent": None,
                            "is_active": True,
                            "sort_order": cfg["sort_order"],
                        },
                    )
                else:
                    parent = Category(name=parent_name, slug=parent_slug)

                self.stdout.write(f"  📂  {parent_name}")

                for sub_name, sub_slug, sub_sort in cfg["subs"]:
                    if not dry:
                        sub, _ = Category.objects.update_or_create(
                            slug=sub_slug,
                            defaults={
                                "name": sub_name,
                                "parent": parent,
                                "is_active": True,
                                "sort_order": sub_sort,
                            },
                        )
                        new_sub_by_slug[sub_slug] = sub
                    self.stdout.write(f"       └─ {sub_name}  ({sub_slug})")

            # ── 2. Re-link seeded products ───────────────────────────────────
            self.stdout.write("\nRe-linking products …")
            moved = skipped = unmatched = 0

            for product in Product.objects.filter(tags__contains=["seeded"]):
                tags = product.tags  # ["seeded", parent_key, sub_folder]
                if len(tags) < 3:
                    skipped += 1
                    continue

                key = (tags[1], tags[2])
                new_slug = TAG_TO_NEW_SUB.get(key)

                if not new_slug:
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠  No mapping for tags {tags} — skipped")
                    )
                    unmatched += 1
                    continue

                new_cat = new_sub_by_slug.get(new_slug)
                if not new_cat:
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠  Sub-category slug '{new_slug}' not found — skipped")
                    )
                    unmatched += 1
                    continue

                if not dry:
                    product.category = new_cat
                    product.save(update_fields=["category"])
                moved += 1

            self.stdout.write(
                f"\n  Moved: {moved}   Skipped: {skipped}   Unmatched: {unmatched}"
            )

            # ── 3. Remove stale categories (no products, not in new tree) ────
            self.stdout.write("\nRemoving stale categories …")
            protected_slugs = set(cfg["slug"] for cfg in NEW_TREE.values())
            for cfg in NEW_TREE.values():
                for _, sub_slug, _ in cfg["subs"]:
                    protected_slugs.add(sub_slug)

            deleted_count = 0
            # Bottom-up: delete children first, then parents
            for cat in Category.objects.exclude(slug__in=protected_slugs).order_by("-parent_id"):
                if cat.products.exists() or cat.children.exists():
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠  Kept (still has content): {cat.name}")
                    )
                    continue
                self.stdout.write(f"  🗑  {cat.name}  ({cat.slug})")
                if not dry:
                    cat.delete()
                deleted_count += 1

            # ── 4. Summary ───────────────────────────────────────────────────
            if dry:
                transaction.set_rollback(True)

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅  Done!  "
                    f"Products moved: {moved}  |  "
                    f"Old categories removed: {deleted_count}"
                )
            )
