"""
Data migration: extract colour/size from ProductVariant.attributes JSONField
→ create ProductColor records and populate variant.color + variant.size.
"""

from django.db import migrations


def extract_colors_and_sizes(apps, schema_editor):
    Product        = apps.get_model("products", "Product")
    ProductColor   = apps.get_model("products", "ProductColor")
    ProductVariant = apps.get_model("products", "ProductVariant")

    for product in Product.objects.prefetch_related("variants").all():
        color_map = {}  # name -> ProductColor instance

        for variant in product.variants.all():
            attrs       = variant.attributes or {}
            color_name  = (attrs.get("color") or "").strip()
            size_name   = (attrs.get("size")  or "").strip()

            # ── migrate size ─────────────────────────────────────────────
            if size_name:
                ProductVariant.objects.filter(pk=variant.pk).update(size=size_name)

            # ── migrate colour ───────────────────────────────────────────
            if color_name:
                if color_name not in color_map:
                    color_obj = ProductColor.objects.create(
                        product    = product,
                        name       = color_name,
                        hex_code   = "",
                        sort_order = len(color_map),
                    )
                    # If this variant has a colour-specific image, attach it
                    if variant.image_id:
                        ProductColor.objects.filter(pk=color_obj.pk).update(
                            image_id=variant.image_id
                        )
                    color_map[color_name] = color_obj

                ProductVariant.objects.filter(pk=variant.pk).update(
                    color=color_map[color_name]
                )


def reverse_migration(apps, schema_editor):
    # Rebuild attributes from color/size fields
    ProductVariant = apps.get_model("products", "ProductVariant")
    ProductColor   = apps.get_model("products", "ProductColor")

    for variant in ProductVariant.objects.select_related("color").all():
        attrs = {}
        if variant.color:
            attrs["color"] = variant.color.name
        if variant.size:
            attrs["size"] = variant.size
        ProductVariant.objects.filter(pk=variant.pk).update(attributes=attrs)

    ProductColor.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_add_product_color_and_variant_color_size"),
    ]

    operations = [
        migrations.RunPython(extract_colors_and_sizes, reverse_migration),
    ]
