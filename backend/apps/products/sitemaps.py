from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from .models import Category, Product


class ProductSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.9
    protocol = "https"
    limit = 5000

    def items(self):
        return Product.objects.filter(status=Product.Status.ACTIVE)

    def location(self, obj):
        return f"/products/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class CategorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8
    protocol = "https"

    def items(self):
        return Category.objects.filter(is_active=True)

    def location(self, obj):
        return f"/categories/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class StaticSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5
    protocol = "https"

    pages = ["/", "/shop/", "/about/", "/contact/"]

    def items(self):
        return self.pages

    def location(self, item):
        return item
