from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import Address, AuditLog, User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "avatar_preview",
        "email",
        "username",
        "full_name",
        "is_staff",
        "is_email_verified",
        "is_active",
        "date_joined",
    )
    list_filter = ("is_staff", "is_superuser", "is_active", "is_email_verified")
    search_fields = ("email", "username", "first_name", "last_name", "phone")
    ordering = ("-date_joined",)
    date_hierarchy = "date_joined"
    list_per_page = 30
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Profile",
            {"fields": ("avatar", "phone", "is_email_verified")},
        ),
    )

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:32px;height:32px;border-radius:50%;'
                'object-fit:cover;" />',
                obj.avatar.url,
            )
        initials = (
            (obj.first_name[:1] + obj.last_name[:1]).upper()
            or obj.email[:2].upper()
        )
        return format_html(
            '<div style="width:32px;height:32px;border-radius:50%;background:#6366f1;'
            'color:#fff;display:flex;align-items:center;justify-content:center;'
            'font-size:11px;font-weight:700;line-height:32px;text-align:center;">'
            "{}</div>",
            initials,
        )
    avatar_preview.short_description = ""

    def full_name(self, obj):
        return obj.get_full_name() or "—"
    full_name.short_description = "Name"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "newsletter_subscribed", "date_of_birth", "created_at")
    list_filter = ("newsletter_subscribed",)
    raw_id_fields = ("user",)
    search_fields = ("user__email", "user__username")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "label",
        "address_type",
        "full_name",
        "city",
        "country",
        "is_default",
    )
    list_filter = ("address_type", "country", "is_default")
    raw_id_fields = ("user",)
    search_fields = ("user__email", "full_name", "city", "postal_code")
    list_per_page = 30


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action_badge", "ip_address", "created_at")
    list_filter = ("action", "created_at")
    readonly_fields = (
        "user",
        "action",
        "ip_address",
        "user_agent",
        "extra",
        "created_at",
    )
    search_fields = ("user__email", "action", "ip_address")
    date_hierarchy = "created_at"
    list_per_page = 50

    def action_badge(self, obj):
        colors = {
            "login": "#27ae60",
            "logout": "#95a5a6",
            "register": "#3498db",
            "failed_login": "#e74c3c",
            "password_change": "#f39c12",
        }
        color = colors.get(obj.action, "#6c757d")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:8px;font-size:11px;">{}</span>',
            color,
            obj.action,
        )
    action_badge.short_description = "Action"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
