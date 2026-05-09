from django.contrib import admin

from .models import PageView


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ("path", "ip", "timestamp")
    list_filter = ("timestamp",)
    search_fields = ("path", "ip")
    readonly_fields = ("path", "ip", "timestamp")
    date_hierarchy = "timestamp"
    list_per_page = 50

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
