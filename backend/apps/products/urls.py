from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryListView,
    ProductViewSet,
    RecentlyViewedView,
    ReviewCreateView,
    SearchSuggestView,
)

router = DefaultRouter()
router.register("", ProductViewSet, basename="product")

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("search/suggest/", SearchSuggestView.as_view(), name="search-suggest"),
    path("recently-viewed/", RecentlyViewedView.as_view(), name="recently-viewed"),
    path(
        "<slug:product_slug>/reviews/",
        ReviewCreateView.as_view(),
        name="product-reviews",
    ),
    path("", include(router.urls)),
]
