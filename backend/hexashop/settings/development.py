from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # noqa
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]

# Use console email in dev
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Relax CSRF in dev
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Disable axes in tests to speed them up
AXES_ENABLED = False
