from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.products.models import Brand, Category, Product, ProductVariant


CATEGORIES = [
    {"name": "Men's Clothing", "children": ["T-Shirts", "Shirts", "Jeans", "Jackets"]},
    {"name": "Women's Clothing", "children": ["Dresses", "Tops", "Skirts", "Coats"]},
    {"name": "Footwear", "children": ["Sneakers", "Boots", "Sandals", "Formal Shoes"]},
    {"name": "Accessories", "children": ["Bags", "Watches", "Sunglasses", "Belts"]},
]

BRANDS = ["Nike", "Adidas", "Zara", "H&M", "Levi's", "Puma", "Gucci", "Uniqlo"]

PRODUCTS = [
    {
        "name": "Classic White T-Shirt",
        "category": "T-Shirts",
        "brand": "Uniqlo",
        "base_price": "19.99",
        "compare_at_price": "29.99",
        "short_description": "A timeless white tee made from 100% organic cotton.",
        "description": "This classic white t-shirt is crafted from premium 100% organic cotton. Featuring a relaxed fit and reinforced stitching, it's the perfect everyday essential that pairs with anything in your wardrobe.",
        "tags": ["cotton", "basic", "everyday", "organic"],
        "is_featured": True,
        "variants": [
            {"name": "S / White", "sku": "CWT-S-W", "stock": 50, "attributes": {"size": "S", "color": "White"}},
            {"name": "M / White", "sku": "CWT-M-W", "stock": 80, "attributes": {"size": "M", "color": "White"}},
            {"name": "L / White", "sku": "CWT-L-W", "stock": 60, "attributes": {"size": "L", "color": "White"}},
            {"name": "XL / White", "sku": "CWT-XL-W", "stock": 30, "attributes": {"size": "XL", "color": "White"}},
        ],
    },
    {
        "name": "Slim Fit Blue Jeans",
        "category": "Jeans",
        "brand": "Levi's",
        "base_price": "59.99",
        "compare_at_price": "79.99",
        "short_description": "Slim fit jeans in a classic blue wash.",
        "description": "These slim fit jeans feature a classic blue wash with just the right amount of stretch for all-day comfort. Made from a durable denim blend, they're built to last through countless wears and washes.",
        "tags": ["denim", "slim", "jeans", "classic"],
        "is_featured": True,
        "variants": [
            {"name": "30x30", "sku": "SSBJ-3030", "stock": 25, "attributes": {"waist": "30", "length": "30"}},
            {"name": "32x30", "sku": "SSBJ-3230", "stock": 40, "attributes": {"waist": "32", "length": "30"}},
            {"name": "32x32", "sku": "SSBJ-3232", "stock": 35, "attributes": {"waist": "32", "length": "32"}},
            {"name": "34x32", "sku": "SSBJ-3432", "stock": 20, "attributes": {"waist": "34", "length": "32"}},
        ],
    },
    {
        "name": "Floral Summer Dress",
        "category": "Dresses",
        "brand": "Zara",
        "base_price": "49.99",
        "compare_at_price": "69.99",
        "short_description": "Lightweight floral midi dress perfect for summer.",
        "description": "This beautiful floral midi dress is made from a lightweight, breathable fabric perfect for warm weather. The elegant floral print and flowing silhouette make it ideal for both casual outings and special occasions.",
        "tags": ["floral", "summer", "midi", "dress"],
        "is_featured": True,
        "variants": [
            {"name": "XS / Floral", "sku": "FSD-XS", "stock": 15, "attributes": {"size": "XS"}},
            {"name": "S / Floral", "sku": "FSD-S", "stock": 25, "attributes": {"size": "S"}},
            {"name": "M / Floral", "sku": "FSD-M", "stock": 30, "attributes": {"size": "M"}},
            {"name": "L / Floral", "sku": "FSD-L", "stock": 20, "attributes": {"size": "L"}},
        ],
    },
    {
        "name": "Air Running Sneakers",
        "category": "Sneakers",
        "brand": "Nike",
        "base_price": "89.99",
        "compare_at_price": "119.99",
        "short_description": "Lightweight running sneakers with air cushioning.",
        "description": "Engineered for performance, these running sneakers feature Nike's signature air cushioning technology for superior comfort on every run. The breathable mesh upper keeps feet cool while the durable rubber outsole provides reliable grip.",
        "tags": ["running", "sports", "sneakers", "cushioning"],
        "is_featured": True,
        "variants": [
            {"name": "UK 7 / White", "sku": "ARS-7-W", "stock": 10, "attributes": {"size": "UK 7", "color": "White"}},
            {"name": "UK 8 / White", "sku": "ARS-8-W", "stock": 20, "attributes": {"size": "UK 8", "color": "White"}},
            {"name": "UK 9 / White", "sku": "ARS-9-W", "stock": 25, "attributes": {"size": "UK 9", "color": "White"}},
            {"name": "UK 10 / White", "sku": "ARS-10-W", "stock": 15, "attributes": {"size": "UK 10", "color": "White"}},
            {"name": "UK 8 / Black", "sku": "ARS-8-B", "stock": 18, "attributes": {"size": "UK 8", "color": "Black"}},
            {"name": "UK 9 / Black", "sku": "ARS-9-B", "stock": 22, "attributes": {"size": "UK 9", "color": "Black"}},
        ],
    },
    {
        "name": "Leather Tote Bag",
        "category": "Bags",
        "brand": "Gucci",
        "base_price": "249.99",
        "compare_at_price": "349.99",
        "short_description": "Premium genuine leather tote bag with gold hardware.",
        "description": "This luxurious tote bag is crafted from premium genuine leather with a smooth finish. Featuring gold-tone hardware, multiple interior pockets, and magnetic snap closure, it combines style with practical functionality.",
        "tags": ["leather", "tote", "luxury", "handbag"],
        "is_featured": False,
        "variants": [
            {"name": "Black", "sku": "LTB-BLK", "stock": 8, "attributes": {"color": "Black"}},
            {"name": "Tan", "sku": "LTB-TAN", "stock": 6, "attributes": {"color": "Tan"}},
            {"name": "Navy", "sku": "LTB-NVY", "stock": 5, "attributes": {"color": "Navy"}},
        ],
    },
    {
        "name": "Striped Polo Shirt",
        "category": "Shirts",
        "brand": "H&M",
        "base_price": "29.99",
        "short_description": "Smart striped polo in breathable pique fabric.",
        "description": "A smart weekend staple, this striped polo shirt is made from breathable pique fabric. The classic striped pattern and relaxed fit make it versatile enough for casual Fridays or weekend outings.",
        "tags": ["polo", "shirt", "stripes", "casual"],
        "is_featured": False,
        "variants": [
            {"name": "S / Blue Stripe", "sku": "SPS-S-BS", "stock": 30, "attributes": {"size": "S", "color": "Blue Stripe"}},
            {"name": "M / Blue Stripe", "sku": "SPS-M-BS", "stock": 45, "attributes": {"size": "M", "color": "Blue Stripe"}},
            {"name": "L / Blue Stripe", "sku": "SPS-L-BS", "stock": 40, "attributes": {"size": "L", "color": "Blue Stripe"}},
            {"name": "M / Red Stripe", "sku": "SPS-M-RS", "stock": 25, "attributes": {"size": "M", "color": "Red Stripe"}},
        ],
    },
    {
        "name": "Ankle Length Boots",
        "category": "Boots",
        "brand": "Zara",
        "base_price": "79.99",
        "compare_at_price": "99.99",
        "short_description": "Sleek ankle boots with block heel.",
        "description": "These sleek ankle boots feature a comfortable block heel and side zip closure for easy wear. Made from faux leather with a smooth finish, they pair effortlessly with jeans, skirts, or dresses.",
        "tags": ["boots", "ankle", "heel", "winter"],
        "is_featured": False,
        "variants": [
            {"name": "UK 4 / Black", "sku": "ALB-4-B", "stock": 12, "attributes": {"size": "UK 4", "color": "Black"}},
            {"name": "UK 5 / Black", "sku": "ALB-5-B", "stock": 18, "attributes": {"size": "UK 5", "color": "Black"}},
            {"name": "UK 6 / Black", "sku": "ALB-6-B", "stock": 15, "attributes": {"size": "UK 6", "color": "Black"}},
            {"name": "UK 5 / Brown", "sku": "ALB-5-BR", "stock": 10, "attributes": {"size": "UK 5", "color": "Brown"}},
        ],
    },
    {
        "name": "Sport Track Jacket",
        "category": "Jackets",
        "brand": "Adidas",
        "base_price": "69.99",
        "compare_at_price": "89.99",
        "short_description": "Lightweight track jacket with classic 3-stripe design.",
        "description": "The iconic Adidas track jacket featuring the signature 3-stripe design on the sleeves. Made from recycled polyester, this lightweight jacket is perfect for workouts, sports, or casual wear.",
        "tags": ["jacket", "sports", "track", "adidas"],
        "is_featured": True,
        "variants": [
            {"name": "S / Black", "sku": "STJ-S-B", "stock": 20, "attributes": {"size": "S", "color": "Black"}},
            {"name": "M / Black", "sku": "STJ-M-B", "stock": 35, "attributes": {"size": "M", "color": "Black"}},
            {"name": "L / Black", "sku": "STJ-L-B", "stock": 30, "attributes": {"size": "L", "color": "Black"}},
            {"name": "M / Navy", "sku": "STJ-M-N", "stock": 25, "attributes": {"size": "M", "color": "Navy"}},
            {"name": "L / Navy", "sku": "STJ-L-N", "stock": 20, "attributes": {"size": "L", "color": "Navy"}},
        ],
    },
    {
        "name": "Slim Chino Trousers",
        "category": "Men's Clothing",
        "brand": "H&M",
        "base_price": "39.99",
        "short_description": "Smart slim-fit chinos in a versatile khaki shade.",
        "description": "These slim-fit chino trousers in a classic khaki shade are a wardrobe essential. Made from a comfortable cotton blend with a hint of stretch, they work equally well for the office or weekend errands.",
        "tags": ["chinos", "slim", "trousers", "smart-casual"],
        "is_featured": False,
        "variants": [
            {"name": "30 / Khaki", "sku": "SCT-30-K", "stock": 20, "attributes": {"waist": "30", "color": "Khaki"}},
            {"name": "32 / Khaki", "sku": "SCT-32-K", "stock": 30, "attributes": {"waist": "32", "color": "Khaki"}},
            {"name": "34 / Khaki", "sku": "SCT-34-K", "stock": 25, "attributes": {"waist": "34", "color": "Khaki"}},
            {"name": "32 / Navy", "sku": "SCT-32-N", "stock": 20, "attributes": {"waist": "32", "color": "Navy"}},
        ],
    },
    {
        "name": "Polarised Aviator Sunglasses",
        "category": "Sunglasses",
        "brand": "Gucci",
        "base_price": "149.99",
        "compare_at_price": "199.99",
        "short_description": "Classic aviator sunglasses with polarised UV400 lenses.",
        "description": "These iconic aviator sunglasses feature polarised UV400 lenses for superior eye protection. The lightweight metal frame and adjustable nose pads ensure a comfortable, secure fit all day long.",
        "tags": ["sunglasses", "aviator", "polarised", "UV400"],
        "is_featured": False,
        "variants": [
            {"name": "Gold / Brown Lens", "sku": "PAS-G-B", "stock": 15, "attributes": {"frame": "Gold", "lens": "Brown"}},
            {"name": "Silver / Grey Lens", "sku": "PAS-S-G", "stock": 12, "attributes": {"frame": "Silver", "lens": "Grey"}},
            {"name": "Black / Black Lens", "sku": "PAS-B-B", "stock": 10, "attributes": {"frame": "Black", "lens": "Black"}},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample products, categories, and brands"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Product.objects.all().delete()
            Category.objects.all().delete()
            Brand.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing data cleared."))

        # Create categories
        self.stdout.write("Creating categories...")
        category_map = {}
        for i, cat_data in enumerate(CATEGORIES):
            parent, _ = Category.objects.get_or_create(
                slug=slugify(cat_data["name"]),
                defaults={"name": cat_data["name"], "sort_order": i, "is_active": True},
            )
            category_map[cat_data["name"]] = parent
            for j, child_name in enumerate(cat_data["children"]):
                child, _ = Category.objects.get_or_create(
                    slug=slugify(child_name),
                    defaults={
                        "name": child_name,
                        "parent": parent,
                        "sort_order": j,
                        "is_active": True,
                    },
                )
                category_map[child_name] = child

        self.stdout.write(self.style.SUCCESS(f"  Created {len(category_map)} categories"))

        # Create brands
        self.stdout.write("Creating brands...")
        brand_map = {}
        for brand_name in BRANDS:
            brand, _ = Brand.objects.get_or_create(
                slug=slugify(brand_name),
                defaults={"name": brand_name, "is_active": True},
            )
            brand_map[brand_name] = brand

        self.stdout.write(self.style.SUCCESS(f"  Created {len(brand_map)} brands"))

        # Create products
        self.stdout.write("Creating products...")
        created = 0
        for i, p_data in enumerate(PRODUCTS):
            category = category_map.get(p_data["category"])
            if not category:
                self.stdout.write(self.style.WARNING(f"  Skipping {p_data['name']}: category '{p_data['category']}' not found"))
                continue

            brand = brand_map.get(p_data["brand"])
            slug = slugify(p_data["name"])

            product, was_created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": p_data["name"],
                    "sku": f"SKU-{i+1:04d}",
                    "category": category,
                    "brand": brand,
                    "base_price": p_data["base_price"],
                    "compare_at_price": p_data.get("compare_at_price"),
                    "short_description": p_data.get("short_description", ""),
                    "description": p_data.get("description", ""),
                    "tags": p_data.get("tags", []),
                    "status": Product.Status.ACTIVE,
                    "is_featured": p_data.get("is_featured", False),
                },
            )

            if was_created:
                for v_data in p_data.get("variants", []):
                    ProductVariant.objects.get_or_create(
                        sku=v_data["sku"],
                        defaults={
                            "product": product,
                            "name": v_data["name"],
                            "stock": v_data["stock"],
                            "attributes": v_data.get("attributes", {}),
                            "is_active": True,
                        },
                    )
                created += 1

        self.stdout.write(self.style.SUCCESS(f"  Created {created} products with variants"))
        self.stdout.write(self.style.SUCCESS("\nSeeding complete!"))
        self.stdout.write(f"  Visit http://localhost:8000/api/v1/products/ to see products")
        self.stdout.write(f"  Visit http://localhost:8000/api/v1/products/categories/ to see categories")
        self.stdout.write(f"  Visit http://localhost:8000/api/v1/products/featured/ to see featured products")
