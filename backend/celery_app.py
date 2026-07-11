import os
from celery import Celery
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hexashop.settings.development")

app = Celery("hexashop")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

app.conf.task_queues = {
    "default": {"exchange": "default", "routing_key": "default"},
    "emails": {"exchange": "emails", "routing_key": "emails"},
    "inventory": {"exchange": "inventory", "routing_key": "inventory"},
    "reporting": {"exchange": "reporting", "routing_key": "reporting"},
}

app.conf.task_default_queue = "default"
app.conf.task_routes = {
    "apps.notifications.tasks.send_back_in_stock_alert": {"queue": "emails"},
    "apps.notifications.tasks.send_newsletter_email": {"queue": "emails"},
    "apps.products.tasks.process_product_images": {"queue": "inventory"},
    "apps.products.tasks.compress_product_image": {"queue": "inventory"},
    "apps.products.tasks.bulk_update_inventory": {"queue": "inventory"},
    "apps.products.tasks.generate_sitemap": {"queue": "reporting"},
}

@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
