from django.db import migrations


def seed_hero_slides(apps, schema_editor):
    """Port the original 3 hardcoded storefront slides into HeroSlide rows so
    the storefront looks identical after switching to the JSON-driven hero."""
    HeroSlide = apps.get_model("store_settings", "HeroSlide")
    if HeroSlide.objects.exists():
        return  # don't duplicate if slides already exist

    from apps.store_settings.hero_defaults import SCHEMA_VERSION, seed_documents

    for name, document, sort_order in seed_documents():
        HeroSlide.objects.create(
            name=name,
            document=document,
            schema_version=SCHEMA_VERSION,
            is_active=True,
            sort_order=sort_order,
        )


def unseed_hero_slides(apps, schema_editor):
    HeroSlide = apps.get_model("store_settings", "HeroSlide")
    HeroSlide.objects.filter(
        name__in=["HEXASHOP Main", "Ethnic Grace", "Big Savings"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("store_settings", "0004_heroasset_heroslide"),
    ]

    operations = [
        migrations.RunPython(seed_hero_slides, unseed_hero_slides),
    ]
