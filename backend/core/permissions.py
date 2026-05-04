from rest_framework.permissions import BasePermission, IsAdminUser


class IsOwnerOrAdmin(BasePermission):
    """Allow access only to the object owner or admin users."""

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        owner_field = getattr(obj, "user", getattr(obj, "owner", None))
        return owner_field == request.user


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return bool(request.user and request.user.is_staff)
