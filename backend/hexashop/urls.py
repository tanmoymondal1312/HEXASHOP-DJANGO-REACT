from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path
from django.views.generic import TemplateView

from apps.products.sitemaps import CategorySitemap, ProductSitemap, StaticSitemap

sitemaps = {
    "products": ProductSitemap,
    "categories": CategorySitemap,
    "static": StaticSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    # Health & metrics
    path("health/", include("health_check.urls")),
    path("", include("django_prometheus.urls")),
    # Sitemap
    path(
        "sitemap.xml",
        sitemap,
        {"sitemaps": sitemaps},
        name="django.contrib.sitemaps.views.sitemap",
    ),
    path("robots.txt", TemplateView.as_view(
        template_name="robots.txt", content_type="text/plain"
    )),
    # API v1
    path("api/v1/", include([
        path("auth/", include("apps.accounts.urls")),
        path("products/", include("apps.products.urls")),
        path("cart/", include("apps.cart.urls")),
        path("wishlist/", include("apps.wishlist.urls")),
        path("notifications/", include("apps.notifications.urls")),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
