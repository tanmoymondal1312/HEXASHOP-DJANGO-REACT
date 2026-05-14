from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # noqa
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]

# Local file storage — Cloudinary লাগবে না dev-এ
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"  # noqa

# Use console email in dev (ইমেইল terminal-এ দেখা যাবে)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# mDNS hostname for LAN access — any device on the same Wi-Fi can reach the site
_LAN_HOST = "tanmoy-ubuntu-computer.local"

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    f"http://{_LAN_HOST}:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    f"http://{_LAN_HOST}:3000",
]

# Disable axes in tests to speed them up
AXES_ENABLED = False

# SQLite fallback যদি PostgreSQL না থাকে (সাময়িক)
import os  # noqa
if not os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",  # noqa
        }
    }
