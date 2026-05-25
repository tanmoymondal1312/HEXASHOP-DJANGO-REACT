from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store_settings', '0002_sitesettings_hero_image_sitesettings_hero_image_alt'),
    ]

    operations = [
        migrations.AddField(
            model_name='banner',
            name='badge_text',
            field=models.CharField(
                blank=True, default='', max_length=100,
                help_text='Small badge above the heading (e.g. "New Arrivals 2025").',
            ),
        ),
        migrations.AddField(
            model_name='banner',
            name='heading_accent',
            field=models.CharField(
                blank=True, default='', max_length=100,
                help_text='Colored second part of heading (e.g. "SHOP" in HEXASHOP).',
            ),
        ),
        migrations.AddField(
            model_name='banner',
            name='description',
            field=models.TextField(
                blank=True, default='',
                help_text='Short paragraph shown under the subtitle.',
            ),
        ),
        migrations.AddField(
            model_name='banner',
            name='accent_color',
            field=models.CharField(
                blank=True, default='#1e90ff', max_length=20,
                help_text='Hex accent colour for this slide (e.g. #1e90ff, #f5a623, #a855f7).',
            ),
        ),
        migrations.AddField(
            model_name='banner',
            name='secondary_cta_text',
            field=models.CharField(
                blank=True, default='', max_length=100,
                verbose_name='Secondary Button Text',
            ),
        ),
        migrations.AddField(
            model_name='banner',
            name='secondary_cta_url',
            field=models.CharField(
                blank=True, default='', max_length=500,
                verbose_name='Secondary Button URL',
            ),
        ),
    ]
