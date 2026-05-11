import socket

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

# Detect all local LAN IPs so mobile devices on the same network can connect
def _lan_origins(ports=(3000,)):
    origins = set()
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None):
            ip = info[4][0]
            if not ip.startswith("127.") and ":" not in ip:
                for port in ports:
                    origins.add(f"http://{ip}:{port}")
    except Exception:
        pass
    return list(origins)

_extra = _lan_origins()

# CORS — allow localhost + any LAN IP on port 3000
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *_extra,
]

# CSRF — same set
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *_extra,
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
