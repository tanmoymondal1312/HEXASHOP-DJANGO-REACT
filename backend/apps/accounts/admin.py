from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Address, AuditLog, User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "is_staff", "date_joined")
    list_filter = ("is_staff", "is_superuser", "is_active", "is_email_verified")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Extra", {"fields": ("avatar", "phone", "is_email_verified")}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "newsletter_subscribed", "created_at")
    raw_id_fields = ("user",)


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "address_type", "city", "country", "is_default")
    list_filter = ("address_type", "country", "is_default")
    raw_id_fields = ("user",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "ip_address", "created_at")
    list_filter = ("action",)
    readonly_fields = ("user", "action", "ip_address", "user_agent", "extra", "created_at")
    search_fields = ("user__email", "action")
