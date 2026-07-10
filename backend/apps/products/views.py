import logging

from django.core.cache import cache
from django.db.models import Avg, Case, Count, F, IntegerField, Prefetch, Q, When
from rest_framework import filters, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from core.cache import (
    CATEGORY_TREE_TTL,
    PRODUCT_DETAIL_TTL,
    SEARCH_SUGGEST_TTL,
    add_recently_viewed,
    get_recently_viewed,
)
from core.pagination import StandardPageNumberPagination
from core.permissions import IsAdminOrReadOnly

from .filters import ProductFilter
from .models import Brand, Category, Product, ProductColor, ProductImage, ProductVariant, Review
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewSerializer,
)

logger = logging.getLogger(__name__)


class CategoryListView(generics.ListAPIView):
    """Return full category tree — cached 6 hours."""
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        cache_key = "category_tree"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        roots = (
            Category.objects.filter(parent=None, is_active=True)
            .prefetch_related(
                Prefetch(
                    "children",
                    queryset=Category.objects.filter(is_active=True).order_by("sort_order"),
                    to_attr="prefetched_children",
                )
            )
            .order_by("sort_order")
        )
        data = CategorySerializer(roots, many=True).data
        cache.set(cache_key, data, CATEGORY_TREE_TTL)
        return Response(data)


class ProductViewSet(ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    filterset_class = ProductFilter
    search_fields = ["name", "short_description", "description", "tags", "brand__name", "category__name", "category__parent__name"]
    ordering_fields = ["base_price", "avg_rating", "sold_count", "created_at", "name"]
    ordering = ["-created_at"]
    pagination_class = StandardPageNumberPagination

    def get_queryset(self):
        qs = (
            Product.objects.filter(status=Product.Status.ACTIVE)
            .select_related("category", "brand")
            .prefetch_related(
                Prefetch(
                    "images",
                    queryset=ProductImage.objects.order_by("sort_order"),
                    to_attr="prefetched_images",
                ),
                Prefetch(
                    "variants",
                    queryset=ProductVariant.objects.filter(is_active=True),
                    to_attr="prefetched_variants",
                ),
            )
        )
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get("pk")
        cache_key = f"product_detail:{slug}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        try:
            product = (
                Product.objects.filter(status=Product.Status.ACTIVE)
                .select_related("category", "brand")
                .prefetch_related(
                    "images",
                    Prefetch(
                        "colors",
                        queryset=ProductColor.objects.select_related("image").order_by("sort_order"),
                    ),
                    Prefetch(
                        "variants",
                        queryset=ProductVariant.objects.filter(is_active=True)
                            .select_related("color"),
                    ),
                    Prefetch(
                        "reviews",
                        queryset=Review.objects.select_related("user").order_by("-created_at"),
                    ),
                )
                .get(slug=slug)
            )
        except Product.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Track view count asynchronously
        Product.objects.filter(pk=product.pk).update(view_count=F("view_count") + 1)

        # Track recently viewed
        user_key = str(request.user.id) if request.user.is_authenticated else request.session.session_key
        if user_key:
            add_recently_viewed(user_key, product.id)

        data = ProductDetailSerializer(product, context={"request": request}).data
        cache.set(cache_key, data, PRODUCT_DETAIL_TTL)
        return Response(data)

    @action(detail=True, methods=["get"], url_path="related")
    def related(self, request, pk=None):
        try:
            product = Product.objects.get(slug=pk, status=Product.Status.ACTIVE)
        except Product.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        related = (
            Product.objects.filter(
                category=product.category, status=Product.Status.ACTIVE
            )
            .exclude(pk=product.pk)
            .select_related("category", "brand")
            .prefetch_related(
                Prefetch("images", queryset=ProductImage.objects.order_by("sort_order"))
            )[:8]
        )
        ctx = {"request": request}
        return Response(ProductListSerializer(related, many=True, context=ctx).data)

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request):
        """Featured products for the home page. Excludes whatever the viral
        carousel is showing so the two home sections never repeat a product."""
        cache_key = "featured_products"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        from django.db.models import ExpressionWrapper, FloatField

        viral_ids = (
            Product.objects.filter(status=Product.Status.ACTIVE)
            .annotate(
                viral_score=ExpressionWrapper(
                    F("sold_count") * 3 + F("review_count") * 2 + F("view_count") * 0.1,
                    output_field=FloatField(),
                )
            )
            .order_by("-viral_score")
            .values_list("id", flat=True)[:18]
        )

        products = (
            Product.objects.filter(is_featured=True, status=Product.Status.ACTIVE)
            .exclude(id__in=list(viral_ids))
            .select_related("category", "brand")
            .prefetch_related(
                Prefetch("images", queryset=ProductImage.objects.order_by("sort_order"))
            )
            .order_by("-sold_count")[:24]
        )
        ctx = {"request": request}
        data = ProductListSerializer(products, many=True, context=ctx).data
        cache.set(cache_key, data, 1800)
        response = Response(data)
        response["Cache-Control"] = "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
        return response

    @action(detail=False, methods=["get"], url_path="viral")
    def viral(self, request):
        """
        Returns the 18 most 'viral' active products — the home page shows them
        in a horizontally-scrollable carousel.
        Virality score = sold_count × 3 + review_count × 2 + view_count × 0.1
        Cached for 15 minutes.
        """
        from django.db.models import ExpressionWrapper, FloatField

        cache_key = "viral_products"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        products = (
            Product.objects.filter(status=Product.Status.ACTIVE)
            .annotate(
                viral_score=ExpressionWrapper(
                    F("sold_count") * 3 + F("review_count") * 2 + F("view_count") * 0.1,
                    output_field=FloatField(),
                )
            )
            .select_related("category", "brand")
            .prefetch_related(
                Prefetch("images", queryset=ProductImage.objects.order_by("sort_order"))
            )
            .order_by("-viral_score")[:18]
        )
        ctx = {"request": request}
        data = ProductListSerializer(products, many=True, context=ctx).data
        cache.set(cache_key, data, 900)
        response = Response(data)
        response["Cache-Control"] = "public, max-age=60, s-maxage=900, stale-while-revalidate=1800"
        return response


class RecentlyViewedView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user_key = (
            str(request.user.id)
            if request.user.is_authenticated
            else request.session.session_key
        )
        if not user_key:
            return Response([])

        ids = get_recently_viewed(user_key)[:12]
        if not ids:
            return Response([])

        products = {p.id: p for p in Product.objects.filter(id__in=ids, status=Product.Status.ACTIVE)
                    .select_related("category")
                    .prefetch_related(
                        Prefetch("images", queryset=ProductImage.objects.filter(is_primary=True))
                    )}
        ordered = [products[pid] for pid in ids if pid in products]
        ctx = {"request": request}
        return Response(ProductListSerializer(ordered, many=True, context=ctx).data)


class SearchSuggestView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if len(q) < 2:
            return Response({"suggestions": [], "products": [], "categories": []})

        cache_key = f"search_suggest:{q.lower()}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        words = q.split()

        # Build product Q: each word must hit at least one field (AND between words)
        product_q = Q()
        for word in words:
            product_q &= (
                Q(name__icontains=word)             |
                Q(short_description__icontains=word) |
                Q(tags__icontains=word)              |
                Q(brand__name__icontains=word)       |
                Q(category__name__icontains=word)    |
                Q(category__parent__name__icontains=word)
            )

        products = (
            Product.objects.filter(product_q, status=Product.Status.ACTIVE)
            .select_related("category", "brand")
            .prefetch_related(
                Prefetch("images", queryset=ProductImage.objects.filter(is_primary=True))
            )
            .annotate(
                relevance=Case(
                    When(name__istartswith=q, then=3),
                    When(name__icontains=q,   then=2),
                    default=1,
                    output_field=IntegerField(),
                )
            )
            .order_by("-relevance", "-sold_count")[:6]
        )

        # Category suggestions: match name or parent name
        cat_q = Q()
        for word in words:
            cat_q &= (Q(name__icontains=word) | Q(parent__name__icontains=word))
        categories = (
            Category.objects.filter(cat_q, is_active=True)
            .select_related("parent")
            .order_by("sort_order")[:4]
        )

        # Text autocomplete suggestions: top matching product names
        suggestions = list(
            Product.objects.filter(product_q, status=Product.Status.ACTIVE)
            .order_by("-sold_count")
            .values_list("name", flat=True)[:5]
        )

        data = {
            "suggestions": suggestions,
            "products": ProductListSerializer(
                products, many=True, context={"request": request}
            ).data,
            "categories": [
                {
                    "name": c.name,
                    "slug": c.slug,
                    "parent": c.parent.name if c.parent else None,
                }
                for c in categories
            ],
        }
        cache.set(cache_key, data, SEARCH_SUGGEST_TTL)
        return Response(data)


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = generics.get_object_or_404(Product, slug=self.kwargs["product_slug"])
        review = serializer.save(product=product)
        # Recalculate denormalized rating
        agg = product.reviews.aggregate(avg=Avg("rating"), count=Count("id"))
        Product.objects.filter(pk=product.pk).update(
            avg_rating=agg["avg"] or 0, review_count=agg["count"] or 0
        )
        cache.delete(f"product_detail:{product.slug}")
