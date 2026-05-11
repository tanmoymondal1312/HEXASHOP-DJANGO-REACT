"""
Seed 9 fashion products from the /fashion folder at the project root.
Each image becomes one active product with one default variant.

Usage:
    python manage.py seed_fashion
    python manage.py seed_fashion --clear   # deletes previously seeded products first
"""

from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from apps.products.models import Category, Product, ProductImage, ProductVariant

# Project root  ─  backend/apps/products/management/commands/seed_fashion.py
ROOT_DIR    = Path(__file__).resolve().parents[5]
FASHION_DIR = ROOT_DIR / "fashion"

PRODUCTS = [
    {
        "sku":           "SHIRT-FS001",
        "name":          "Regular Fit Bengal Stripe Templeton Formal Shirt",
        "slug":          "regular-fit-bengal-stripe-templeton-formal-shirt",
        "category_slug": "mens-tops",
        "price":         "29.99",
        "compare_price": "45.00",
        "image":         "Mens-Formal-SHirt/Regular Fit Bengal Stripe Templeton Formal Shirt.webp",
        "color":         "White Stripe",
        "size":          "M",
        "stock":         45,
        "short_desc":    "Classic Bengal stripe formal shirt in regular fit — a wardrobe essential.",
        "description":   (
            "A classic Regular Fit Bengal Stripe Templeton Formal Shirt crafted for the modern gentleman. "
            "The refined stripe pattern adds a sophisticated touch while the relaxed regular fit ensures "
            "all-day comfort. Perfect for the office, meetings, or formal occasions."
        ),
        "tags":          ["formal", "shirt", "mens", "stripe", "office"],
        "is_featured":   True,
    },
    {
        "sku":           "SHIRT-FS002",
        "name":          "Regular Fit Bengal Stripe Templeton Formal Shirt Blue",
        "slug":          "regular-fit-bengal-stripe-templeton-formal-shirt-blue",
        "category_slug": "mens-tops",
        "price":         "32.99",
        "compare_price": "48.00",
        "image":         "Mens-Formal-SHirt/Regular Fit Bengal Stripe Templeton Formal Shirt Blue.webp",
        "color":         "Blue",
        "size":          "M",
        "stock":         38,
        "short_desc":    "Bengal stripe formal shirt in a rich blue — sharp and professional.",
        "description":   (
            "The Bengal Stripe Templeton Formal Shirt in a sophisticated blue colorway. "
            "Tailored in a comfortable regular fit with premium fabric that keeps you looking "
            "crisp from morning to evening. A must-have for every professional wardrobe."
        ),
        "tags":          ["formal", "shirt", "mens", "blue", "office"],
        "is_featured":   False,
    },
    {
        "sku":           "WATCH-MN001",
        "name":          "Stylist Watch For Men",
        "slug":          "stylist-watch-for-men",
        "category_slug": "jewelry-watches",
        "price":         "49.99",
        "compare_price": "89.99",
        "image":         "Mens Watch/Stylist Watch For Men.webp",
        "color":         "Silver",
        "size":          "One Size",
        "stock":         22,
        "short_desc":    "Premium stylish watch crafted for the modern man.",
        "description":   (
            "Elevate your style with this Stylist Watch For Men, featuring a sleek silver-tone case "
            "and a refined dial that makes a statement at any occasion. Built with durable materials "
            "and a water-resistant design, it transitions effortlessly from boardroom to evening events."
        ),
        "tags":          ["watch", "mens", "accessories", "silver", "premium"],
        "is_featured":   True,
    },
    {
        "sku":           "SAREE-WM001",
        "name":          "Women's Saree",
        "slug":          "womens-saree",
        "category_slug": "dresses",
        "price":         "24.99",
        "compare_price": "40.00",
        "image":         "shari/Women's Saree.webp",
        "color":         "Multicolor",
        "size":          "Free Size",
        "stock":         30,
        "short_desc":    "Elegant traditional saree — perfect for festive occasions.",
        "description":   (
            "This Women's Saree is crafted with fine quality fabric that drapes beautifully, "
            "making you the centre of attention at every festive occasion and traditional ceremony. "
            "The vibrant colour palette and intricate detailing make it a timeless addition to your wardrobe."
        ),
        "tags":          ["saree", "womens", "traditional", "ethnic", "festive"],
        "is_featured":   True,
    },
    {
        "sku":           "SAREE-WM002",
        "name":          "Women's Saree White",
        "slug":          "womens-saree-white",
        "category_slug": "dresses",
        "price":         "22.99",
        "compare_price": "38.00",
        "image":         "shari/Women's Saree-White.webp",
        "color":         "White",
        "size":          "Free Size",
        "stock":         25,
        "short_desc":    "Pristine white saree exuding grace and elegance.",
        "description":   (
            "A pristine white Women's Saree that radiates grace, purity, and elegance. "
            "The lightweight fabric ensures a comfortable drape throughout the day. "
            "Ideal for Eid, Puja, weddings, and any traditional event where you want to look effortlessly stunning."
        ),
        "tags":          ["saree", "womens", "white", "traditional", "ethnic"],
        "is_featured":   False,
    },
    {
        "sku":           "BAG-WH001",
        "name":          "Chic Shoulder Bag for Women",
        "slug":          "chic-shoulder-bag-for-women",
        "category_slug": "handbags",
        "price":         "39.99",
        "compare_price": "65.00",
        "image":         "Women-Hand-Bags/Chic Shoulder Bags for Women in Bangladesh | Patchee BD.webp",
        "color":         "Beige",
        "size":          "One Size",
        "stock":         18,
        "short_desc":    "Trendy chic shoulder bag — the perfect everyday companion.",
        "description":   (
            "The Chic Shoulder Bag for Women by Patchee BD combines style and practicality in one elegant package. "
            "Featuring spacious compartments, durable stitching, and a premium finish, this bag is designed to "
            "complement any outfit — from casual daywear to chic evening looks."
        ),
        "tags":          ["bag", "handbag", "womens", "shoulder bag", "beige"],
        "is_featured":   True,
    },
    {
        "sku":           "BAG-WH002",
        "name":          "Chic Shoulder Bag for Women Brown",
        "slug":          "chic-shoulder-bag-for-women-brown",
        "category_slug": "handbags",
        "price":         "44.99",
        "compare_price": "72.00",
        "image":         "Women-Hand-Bags/Chic Shoulder Bags for Women in Bangladesh | Patchee BD Brown.webp",
        "color":         "Brown",
        "size":          "One Size",
        "stock":         15,
        "short_desc":    "Premium brown shoulder bag with rich texture and elegant finish.",
        "description":   (
            "This rich brown Chic Shoulder Bag by Patchee BD is a statement piece for any fashion-forward woman. "
            "Crafted with premium faux leather and meticulous stitching, it combines durability with luxury aesthetics. "
            "Versatile enough for both casual outings and semi-formal settings."
        ),
        "tags":          ["bag", "handbag", "womens", "shoulder bag", "brown", "premium"],
        "is_featured":   False,
    },
    {
        "sku":           "JEAN-WM001",
        "name":          "Wide-Leg High-Waist Denim Jeans",
        "slug":          "wide-leg-high-waist-denim-jeans",
        "category_slug": "womens-bottoms",
        "price":         "34.99",
        "compare_price": "55.00",
        "image":         "Women Jeans/Wide-leg High-Waist Denim.webp",
        "color":         "Blue",
        "size":          "M",
        "stock":         40,
        "short_desc":    "Wide-leg high-waist denim jeans — effortlessly chic.",
        "description":   (
            "These Wide-Leg High-Waist Denim Jeans are the ultimate fusion of comfort and contemporary style. "
            "The high waist accentuates your silhouette while the wide-leg cut gives a relaxed, fashion-forward look. "
            "Made from quality stretch denim for all-day wearability."
        ),
        "tags":          ["jeans", "denim", "womens", "wide-leg", "high-waist"],
        "is_featured":   True,
    },
    {
        "sku":           "JEAN-WM002",
        "name":          "Wide-Leg High-Waist Denim Jeans Black",
        "slug":          "wide-leg-high-waist-denim-jeans-black",
        "category_slug": "womens-bottoms",
        "price":         "36.99",
        "compare_price": "58.00",
        "image":         "Women Jeans/Wide-leg High-Waist Denim Black.webp",
        "color":         "Black",
        "size":          "M",
        "stock":         35,
        "short_desc":    "Sleek black wide-leg denim jeans — versatile and bold.",
        "description":   (
            "The black Wide-Leg High-Waist Denim Jeans are a wardrobe staple that never goes out of style. "
            "The sleek black tone pairs with virtually anything — from a simple tee to a dressy blouse. "
            "The high-waist design flatters every body type while the wide leg adds a modern editorial edge."
        ),
        "tags":          ["jeans", "denim", "womens", "wide-leg", "black"],
        "is_featured":   False,
    },
]


class Command(BaseCommand):
    help = "Seed 9 fashion products from the /fashion folder"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete previously seeded fashion products before re-seeding",
        )

    def handle(self, *args, **options):
        if not FASHION_DIR.exists():
            raise CommandError(f"Fashion folder not found: {FASHION_DIR}")

        if options["clear"]:
            skus = [p["sku"] for p in PRODUCTS]
            deleted, _ = Product.objects.filter(sku__in=skus).delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} previously seeded products."))

        created = 0
        skipped = 0

        for data in PRODUCTS:
            img_path = FASHION_DIR / data["image"]
            if not img_path.exists():
                self.stdout.write(self.style.WARNING(f"  Image not found, skipping: {img_path}"))
                skipped += 1
                continue

            # Skip if already exists
            if Product.objects.filter(sku=data["sku"]).exists():
                self.stdout.write(f"  Already exists: {data['sku']} — skip")
                skipped += 1
                continue

            # Resolve category
            try:
                category = Category.objects.get(slug=data["category_slug"])
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"  Category '{data['category_slug']}' not found for {data['sku']}, skipping."
                ))
                skipped += 1
                continue

            # Create product
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

            # Create default variant
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

            # Upload image
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

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {created} created, {skipped} skipped."
        ))
