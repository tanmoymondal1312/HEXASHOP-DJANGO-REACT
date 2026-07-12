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
from apps.products.models import Category, Product, ProductColor, ProductImage, ProductVariant
from apps.store_settings.models import Banner, SiteSettings

from django.core.cache import cache

from .forms import (
    AnnouncementForm, CategoryForm, ProductForm, COMMON_SIZES,
)


# ── Cache invalidation ────────────────────────────────────────────────────────

def _bust_cache(product=None):
    keys = ["featured_products", "viral_products", "category_tree"]
    if product:
        keys.append(f"product_detail:{product.slug}")
    cache.delete_many(keys)


from .models import PageView


# ── Colour + Size variant save helper ─────────────────────────────────────────

def _save_colors_and_variants(request, product):
    """
    Parse the custom colour/size/stock POST data and create/update
    ProductColor + ProductVariant records for the given product.

    POST shape (all repeated with index 0‥N):
        color_name_0, color_hex_0, color_image_0, color_id_0
        size_0 … size_K  (repeated size keys)
        stock_{color_idx}_{size_idx}
        price_{color_idx}_{size_idx}   (optional override)
    """
    import re

    # ── 1. Parse colours ──────────────────────────────────────────────────────
    colour_idx = 0
    colours_data = []
    while f"color_name_{colour_idx}" in request.POST:
        colours_data.append({
            "idx":      colour_idx,
            "id":       request.POST.get(f"color_id_{colour_idx}", "").strip(),
            "name":     request.POST.get(f"color_name_{colour_idx}", "").strip(),
            "hex_code": request.POST.get(f"color_hex_{colour_idx}", "").strip(),
            "image":    request.FILES.get(f"color_image_{colour_idx}"),
        })
        colour_idx += 1

    # ── 2. Parse sizes ─────────────────────────────────────────────────────────
    sizes = [v.strip() for v in request.POST.getlist("sizes") if v.strip()]

    # ── 3. Nothing to do — user left both sections empty; preserve existing data
    if not colours_data and not sizes:
        return

    touched_color_pks  = set()
    touched_variant_pks = set()

    if colours_data:
        # ── 4a. WITH colours: full colour × size matrix ───────────────────────
        for ci, cd in enumerate(colours_data):
            if not cd["name"]:
                continue

            # Get or create ProductColor
            if cd["id"]:
                try:
                    color_obj = ProductColor.objects.get(pk=int(cd["id"]), product=product)
                    color_obj.name     = cd["name"]
                    color_obj.hex_code = cd["hex_code"]
                    color_obj.sort_order = ci
                    color_obj.save()
                except ProductColor.DoesNotExist:
                    color_obj = None
            else:
                color_obj = None

            if color_obj is None:
                color_obj = ProductColor.objects.create(
                    product=product,
                    name=cd["name"],
                    hex_code=cd["hex_code"],
                    sort_order=ci,
                )

            # Handle colour image — replace old so it doesn't linger
            if cd["image"]:
                old_image = color_obj.image
                pi = ProductImage.objects.create(
                    product=product,
                    image=cd["image"],
                    alt_text=f"{product.name} – {cd['name']}",
                    is_primary=False,
                    sort_order=ci,
                )
                color_obj.image = pi
                color_obj.save(update_fields=["image"])
                if old_image and old_image.pk != pi.pk:
                    old_image.delete()

            touched_color_pks.add(color_obj.pk)

            for si, size in enumerate(sizes):
                stock = int(request.POST.get(f"stock_{ci}_{si}", 0) or 0)
                price_raw = request.POST.get(f"price_{ci}_{si}", "").strip()
                price = price_raw if price_raw else None
                auto_sku = f"{product.sku}-{re.sub(r'[^A-Z0-9]', '', cd['name'].upper())[:4]}-{size.upper().replace(' ', '')}"

                variant, _ = ProductVariant.objects.get_or_create(
                    product=product, color=color_obj, size=size,
                    defaults={"sku": auto_sku},
                )
                variant.stock = stock
                variant.price = price
                if not variant.sku:
                    variant.sku = auto_sku
                variant.is_active = True
                variant.save()
                touched_variant_pks.add(variant.pk)

    else:
        # ── 4b. WITHOUT colours: size-only variants (colour = None) ───────────
        # The JS matrix sends stock_0_{size_idx} for the single "Default" column.
        for si, size in enumerate(sizes):
            stock = int(request.POST.get(f"stock_0_{si}", 0) or 0)
            price_raw = request.POST.get(f"price_0_{si}", "").strip()
            price = price_raw if price_raw else None
            auto_sku = f"{product.sku}-{size.upper().replace(' ', '')}"

            variant, _ = ProductVariant.objects.get_or_create(
                product=product, color=None, size=size,
                defaults={"sku": auto_sku},
            )
            variant.stock = stock
            variant.price = price
            if not variant.sku:
                variant.sku = auto_sku
            variant.is_active = True
            variant.save()
            touched_variant_pks.add(variant.pk)

    # ── 5. Delete colours/variants that were removed ───────────────────────────
    ProductVariant.objects.filter(product=product).exclude(pk__in=touched_variant_pks).delete()
    ProductColor.objects.filter(product=product).exclude(pk__in=touched_color_pks).delete()


def _save_gallery_images(request, product):
    """
    Handle the standalone gallery image section:
      • delete images whose IDs appear in POST[delete_image_ids]
      • upload any files in FILES[gallery_files]
      • set primary via POST[primary_image_id]
    """
    # Delete requested images (skip any currently used as a colour image)
    colour_image_ids = set(
        ProductColor.objects.filter(product=product)
        .exclude(image=None)
        .values_list("image_id", flat=True)
    )
    delete_ids_raw = request.POST.get("delete_image_ids", "")
    delete_ids = [int(x) for x in delete_ids_raw.split(",") if x.strip().isdigit()]
    for img_id in delete_ids:
        if img_id not in colour_image_ids:
            ProductImage.objects.filter(pk=img_id, product=product).delete()

    # Upload new gallery images
    for f in request.FILES.getlist("gallery_files"):
        ProductImage.objects.create(
            product=product,
            image=f,
            alt_text=product.name,
            is_primary=False,
            sort_order=999,
        )

    # Set primary image
    primary_id_raw = request.POST.get("primary_image_id", "").strip()
    if primary_id_raw.isdigit():
        pid = int(primary_id_raw)
        ProductImage.objects.filter(product=product).update(is_primary=False)
        ProductImage.objects.filter(pk=pid, product=product).update(is_primary=True)

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


# ── Hero Slides ────────────────────────────────────────────────────────────────

@staff_required
def hero_image(request):
    """Hero slides are now managed in the new visual Hero Builder Studio
    (Next.js, JSON-document driven). This page just points staff there — the old
    Banner-based editor is deprecated and no longer feeds the storefront."""
    from django.conf import settings
    from apps.store_settings.models import HeroSlide

    # Prefer the configured studio URL (dev sets HERO_STUDIO_URL to the LAN
    # host:3000 so auth cookies line up). In production the storefront is
    # served on THIS same domain by nginx, so a relative link is always right —
    # never a :3000 port, which isn't publicly exposed.
    studio_url = getattr(settings, "HERO_STUDIO_URL", None) or (
        f"http://{request.get_host().split(':')[0]}:3000/studio/hero"
        if settings.DEBUG
        else "/studio/hero"
    )
    return render(request, "admin_panel/hero_image.html", {
        "studio_url": studio_url,
        "slide_count": HeroSlide.objects.count(),
    })


def _slide_defaults():
    """Return a dict with empty defaults for every slide field."""
    return {
        "title": "",
        "heading_accent": "",
        "badge_text": "",
        "subtitle": "",
        "description": "",
        "accent_color": "#1e90ff",
        "cta_text": "",
        "cta_url": "",
        "secondary_cta_text": "",
        "secondary_cta_url": "",
        "sort_order": "0",
        "is_active": "1",
    }


def _slide_to_dict(slide):
    """Serialise a Banner instance into a plain dict for the template."""
    return {
        "title":               slide.title,
        "heading_accent":      slide.heading_accent,
        "badge_text":          slide.badge_text,
        "subtitle":            slide.subtitle,
        "description":         slide.description,
        "accent_color":        slide.accent_color or "#1e90ff",
        "cta_text":            slide.cta_text,
        "cta_url":             slide.cta_url,
        "secondary_cta_text":  slide.secondary_cta_text,
        "secondary_cta_url":   slide.secondary_cta_url,
        "sort_order":          str(slide.sort_order),
        "is_active":           "1" if slide.is_active else "0",
    }


@staff_required
def hero_slide_add(request):
    """Add a new hero slide."""
    errors = {}

    if request.method == "POST":
        data = request.POST
        title = data.get("title", "").strip()
        if not title:
            errors["title"] = "Heading is required."

        if not errors:
            slide = Banner(position="hero")
            slide.title              = title
            slide.heading_accent     = data.get("heading_accent", "").strip()
            slide.badge_text         = data.get("badge_text", "").strip()
            slide.subtitle           = data.get("subtitle", "").strip()
            slide.description        = data.get("description", "").strip()
            slide.accent_color       = data.get("accent_color", "#1e90ff").strip() or "#1e90ff"
            slide.cta_text           = data.get("cta_text", "").strip()
            slide.cta_url            = data.get("cta_url", "").strip()
            slide.secondary_cta_text = data.get("secondary_cta_text", "").strip()
            slide.secondary_cta_url  = data.get("secondary_cta_url", "").strip()
            slide.sort_order         = int(data.get("sort_order", 0) or 0)
            slide.is_active          = data.get("is_active") == "1"
            if "image" in request.FILES:
                slide.image = request.FILES["image"]
            slide.save()
            cache.delete("public_site_settings")
            return redirect("/panel/hero-image/?msg=added")

        # POST with errors — keep what the user typed
        form_data = dict(request.POST)
    else:
        # GET — empty form
        form_data = _slide_defaults()

    return render(request, "admin_panel/hero_slides/form.html", {
        "action": "Add",
        "slide": None,
        "data": form_data,
        "errors": errors,
        "saved": False,
    })


@staff_required
def hero_slide_edit(request, pk):
    """Edit an existing hero slide."""
    slide = get_object_or_404(Banner, pk=pk, position="hero")
    errors = {}

    if request.method == "POST":
        post = request.POST
        title = post.get("title", "").strip()
        if not title:
            errors["title"] = "Heading is required."

        if not errors:
            slide.title              = title
            slide.heading_accent     = post.get("heading_accent", "").strip()
            slide.badge_text         = post.get("badge_text", "").strip()
            slide.subtitle           = post.get("subtitle", "").strip()
            slide.description        = post.get("description", "").strip()
            slide.accent_color       = post.get("accent_color", "#1e90ff").strip() or "#1e90ff"
            slide.cta_text           = post.get("cta_text", "").strip()
            slide.cta_url            = post.get("cta_url", "").strip()
            slide.secondary_cta_text = post.get("secondary_cta_text", "").strip()
            slide.secondary_cta_url  = post.get("secondary_cta_url", "").strip()
            slide.sort_order         = int(post.get("sort_order", 0) or 0)
            slide.is_active          = post.get("is_active") == "1"
            if "image" in request.FILES:
                slide.image = request.FILES["image"]
            elif post.get("clear_image"):
                slide.image = None
            slide.save()
            cache.delete("public_site_settings")
            return redirect(f"/panel/hero-image/{pk}/edit/?saved=1")

        # POST with validation errors — keep what the user typed
        form_data = dict(request.POST)
    else:
        # GET — pre-fill from the existing slide
        form_data = _slide_to_dict(slide)

    return render(request, "admin_panel/hero_slides/form.html", {
        "action": "Edit",
        "slide": slide,          # still passed so the template can show current image
        "data": form_data,
        "errors": errors,
        "saved": request.GET.get("saved") == "1",
    })


@staff_required
def hero_slide_delete(request, pk):
    """Delete a hero slide."""
    slide = get_object_or_404(Banner, pk=pk, position="hero")
    if request.method == "POST":
        slide.delete()
        cache.delete("public_site_settings")
        return redirect("/panel/hero-image/?msg=deleted")
    return render(request, "admin_panel/hero_slides/delete.html", {"slide": slide})


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

    if request.method == "POST" and form.is_valid():
        product = form.save()
        _save_gallery_images(request, product)
        _save_colors_and_variants(request, product)
        _bust_cache(product)
        return redirect(f"/panel/products/{product.pk}/edit/?saved=1")

    return render(request, "admin_panel/products/form.html", {
        "form": form,
        "action": "Add",
        "common_sizes": COMMON_SIZES,
        "existing_colors": [],
        "existing_sizes": [],
        "stock_matrix": {},
        "gallery_images": [],
        "colour_image_ids": set(),
        "submitted": request.method == "POST",
    })


@staff_required
def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form    = ProductForm(request.POST or None, instance=product)

    if request.method == "POST" and form.is_valid():
        saved = form.save()
        _save_gallery_images(request, saved)
        _save_colors_and_variants(request, saved)
        _bust_cache(saved)
        return redirect(f"/panel/products/{saved.pk}/edit/?saved=1")

    # Build existing data for the template
    colour_image_ids = set(
        product.colors.exclude(image=None).values_list("image_id", flat=True)
    )
    gallery_images = list(
        product.images.order_by("sort_order", "id")
    )
    colors = list(product.colors.select_related("image").order_by("sort_order"))
    sizes  = sorted(
        set(
            v.size for v in product.variants.filter(is_active=True) if v.size
        )
    )
    # stock_matrix[color_pk_or_empty][size] = {stock, price}
    stock_matrix = {}
    for color in colors:
        stock_matrix[color.pk] = {}
        for v in product.variants.filter(color=color, is_active=True):
            stock_matrix[color.pk][v.size] = {
                "stock": v.stock,
                "price": str(v.price) if v.price else "",
            }
    # No-colour variants use "" as key (matches JS col.id for the "Default" column)
    no_colour_variants = product.variants.filter(color=None, is_active=True)
    if no_colour_variants.exists():
        stock_matrix[""] = {}
        for v in no_colour_variants:
            if v.size:
                stock_matrix[""][v.size] = {
                    "stock": v.stock,
                    "price": str(v.price) if v.price else "",
                }

    return render(request, "admin_panel/products/form.html", {
        "form": form,
        "action": "Edit",
        "product": product,
        "common_sizes": COMMON_SIZES,
        "existing_colors": colors,
        "existing_sizes": sizes,
        "stock_matrix": stock_matrix,
        "gallery_images": gallery_images,
        "colour_image_ids": colour_image_ids,
        "submitted": request.method == "POST",
    })


@staff_required
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        _bust_cache(product)
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
        _bust_cache()
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
        _bust_cache()
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
        _bust_cache()
        category.delete()
        return redirect("admin_panel:category_list")
    return render(
        request,
        "admin_panel/products/confirm_delete.html",
        {"object": category, "type": "Category"},
    )
