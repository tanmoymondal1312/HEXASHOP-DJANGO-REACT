import json
from datetime import timedelta

from urllib.parse import urlencode

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Count
from django.db.models.functions import TruncHour
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from apps.accounts.models import User
from apps.cart.models import CartItem
from apps.products.models import Category, Product
from apps.store_settings.models import SiteSettings

from django.core.cache import cache

from .forms import AnnouncementForm, CategoryForm, ProductForm, ProductImageFormSet
from .models import PageView

# ── Auth helper ───────────────────────────────────────────────────────────────

staff_required = user_passes_test(
    lambda u: u.is_active and u.is_staff,
    login_url="/panel/login/",
)


# ── Login / Logout ────────────────────────────────────────────────────────────

def panel_login(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("admin_panel:dashboard")

    error = None
    if request.method == "POST":
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")
        user = authenticate(request, username=email, password=password)
        if user and user.is_staff:
            login(request, user)
            return redirect(request.GET.get("next", "admin_panel:dashboard"))
        error = "Invalid email or password."

    return render(request, "admin_panel/login.html", {"error": error})


def panel_logout(request):
    logout(request)
    return redirect("admin_panel:login")


# ── Dashboard ─────────────────────────────────────────────────────────────────

@staff_required
def dashboard(request):
    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    last_1h = now - timedelta(hours=1)

    # ── Stats cards
    total_products = Product.objects.filter(status="active").count()
    total_categories = Category.objects.filter(is_active=True).count()
    total_users = User.objects.count()
    new_users_today = User.objects.filter(
        date_joined__gte=now.replace(hour=0, minute=0, second=0)
    ).count()

    views_last_hour = PageView.objects.filter(timestamp__gte=last_1h).count()
    cart_last_hour = CartItem.objects.filter(added_at__gte=last_1h).count()

    # ── Build 24 hour buckets for charts
    hours = [
        (now - timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
        for i in range(23, -1, -1)
    ]

    pv_data = (
        PageView.objects.filter(timestamp__gte=last_24h)
        .annotate(hour=TruncHour("timestamp"))
        .values("hour")
        .annotate(count=Count("id"))
    )
    cart_data = (
        CartItem.objects.filter(added_at__gte=last_24h)
        .annotate(hour=TruncHour("added_at"))
        .values("hour")
        .annotate(count=Count("id"))
    )

    pv_map = {item["hour"]: item["count"] for item in pv_data}
    cart_map = {item["hour"]: item["count"] for item in cart_data}

    chart_labels = [h.strftime("%-I %p") for h in hours]
    pv_values = [pv_map.get(h, 0) for h in hours]
    cart_values = [cart_map.get(h, 0) for h in hours]

    # ── Recent products
    recent_products = (
        Product.objects.select_related("category")
        .order_by("-created_at")[:5]
    )

    ctx = {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_users": total_users,
        "new_users_today": new_users_today,
        "views_last_hour": views_last_hour,
        "cart_last_hour": cart_last_hour,
        "chart_labels": json.dumps(chart_labels),
        "pv_values": json.dumps(pv_values),
        "cart_values": json.dumps(cart_values),
        "recent_products": recent_products,
    }
    return render(request, "admin_panel/dashboard.html", ctx)


@staff_required
def stats_api(request):
    """AJAX endpoint — polled every 30 s to refresh live counters."""
    now = timezone.now()
    last_1h = now - timedelta(hours=1)
    return JsonResponse(
        {
            "views_last_hour": PageView.objects.filter(timestamp__gte=last_1h).count(),
            "cart_last_hour": CartItem.objects.filter(added_at__gte=last_1h).count(),
        }
    )


# ── Announcement Bar ──────────────────────────────────────────────────────────

@staff_required
def announcement(request):
    obj = SiteSettings.load()
    form = AnnouncementForm(request.POST or None, instance=obj)
    if request.method == "POST" and form.is_valid():
        form.save()
        cache.delete("public_site_settings")
        return render(request, "admin_panel/announcement.html", {"form": form, "saved": True})
    return render(request, "admin_panel/announcement.html", {"form": form})


# ── Hero Image ────────────────────────────────────────────────────────────────

@staff_required
def hero_image(request):
    obj = SiteSettings.load()
    saved = False
    if request.method == "POST":
        alt = request.POST.get("hero_image_alt", "").strip()
        obj.hero_image_alt = alt
        if "hero_image" in request.FILES:
            obj.hero_image = request.FILES["hero_image"]
        elif request.POST.get("clear_hero_image"):
            obj.hero_image = None
        obj.save()
        cache.delete("public_site_settings")
        saved = True
    return render(request, "admin_panel/hero_image.html", {"obj": obj, "saved": saved})


# ── Products ──────────────────────────────────────────────────────────────────

@staff_required
def product_list(request):
    qs = (
        Product.objects.select_related("category", "brand")
        .order_by("-created_at")
    )
    q = request.GET.get("q", "").strip()
    if q:
        qs = qs.filter(name__icontains=q)
    status_filter = request.GET.get("status", "")
    if status_filter:
        qs = qs.filter(status=status_filter)

    return render(
        request,
        "admin_panel/products/list.html",
        {
            "products": qs,
            "q": q,
            "status_filter": status_filter,
            "msg": request.GET.get("msg", ""),
            "msg_name": request.GET.get("name", ""),
        },
    )


@staff_required
def product_add(request):
    form = ProductForm(request.POST or None)
    image_formset = ProductImageFormSet(
        request.POST or None,
        request.FILES or None,
        prefix="images",
    )
    if request.method == "POST" and form.is_valid() and image_formset.is_valid():
        product = form.save()
        image_formset.instance = product
        image_formset.save()
        qs = urlencode({"msg": "added", "name": product.name})
        return redirect(f"/panel/products/?{qs}")
    return render(request, "admin_panel/products/form.html", {
        "form": form,
        "image_formset": image_formset,
        "action": "Add",
    })


@staff_required
def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form = ProductForm(request.POST or None, instance=product)
    image_formset = ProductImageFormSet(
        request.POST or None,
        request.FILES or None,
        instance=product,
        prefix="images",
    )
    if request.method == "POST" and form.is_valid() and image_formset.is_valid():
        saved_product = form.save()
        image_formset.save()
        qs = urlencode({"msg": "updated", "name": saved_product.name})
        return redirect(f"/panel/products/?{qs}")
    return render(
        request,
        "admin_panel/products/form.html",
        {"form": form, "image_formset": image_formset, "action": "Edit", "product": product},
    )


@staff_required
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        product.delete()
        return redirect("/panel/products/?msg=deleted")
    return render(
        request, "admin_panel/products/confirm_delete.html", {"object": product, "type": "Product"}
    )


# ── Categories ────────────────────────────────────────────────────────────────

@staff_required
def category_list(request):
    categories = Category.objects.select_related("parent").order_by("sort_order", "name")
    return render(request, "admin_panel/categories/list.html", {"categories": categories})


@staff_required
def category_add(request):
    form = CategoryForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("admin_panel:category_list")
    return render(
        request, "admin_panel/categories/form.html", {"form": form, "action": "Add"}
    )


@staff_required
def category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    form = CategoryForm(request.POST or None, instance=category)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("admin_panel:category_list")
    return render(
        request,
        "admin_panel/categories/form.html",
        {"form": form, "action": "Edit", "category": category},
    )


@staff_required
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == "POST":
        category.delete()
        return redirect("admin_panel:category_list")
    return render(
        request,
        "admin_panel/products/confirm_delete.html",
        {"object": category, "type": "Category"},
    )
