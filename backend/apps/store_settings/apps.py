from django.apps import AppConfig


class StoreSettingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.store_settings"
    verbose_name = "Store Settings"

    def ready(self):
        from django.contrib import admin
        admin.site.site_header = "HEXASHOP Admin"
        admin.site.site_title = "HEXASHOP Admin Portal"
        admin.site.index_title = "Welcome to HEXASHOP Administration"
