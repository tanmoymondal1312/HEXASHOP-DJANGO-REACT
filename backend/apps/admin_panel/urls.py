from django.urls import path

from . import views

app_name = "admin_panel"
#Main Stream URL of Admin Pannel

urlpatterns = [
    path("login/", views.panel_login, name="login"),
    path("logout/", views.panel_logout, name="logout"),
    path("", views.dashboard, name="dashboard"),
    path("api/stats/", views.stats_api, name="stats_api"),
    path("announcement/", views.announcement, name="announcement"),
    path("hero-image/", views.hero_image, name="hero_image"),
    path("hero-image/add/", views.hero_slide_add, name="hero_slide_add"),
    path("hero-image/<int:pk>/edit/", views.hero_slide_edit, name="hero_slide_edit"),
    path("hero-image/<int:pk>/delete/", views.hero_slide_delete, name="hero_slide_delete"),
    # Products
    path("products/", views.product_list, name="product_list"),
    path("products/add/", views.product_add, name="product_add"),
    path("products/<int:pk>/edit/", views.product_edit, name="product_edit"),
    path("products/<int:pk>/delete/", views.product_delete, name="product_delete"),
    # Categories
    path("categories/", views.category_list, name="category_list"),
    path("categories/add/", views.category_add, name="category_add"),
    path("categories/<int:pk>/edit/", views.category_edit, name="category_edit"),
    path("categories/<int:pk>/delete/", views.category_delete, name="category_delete"),
]
