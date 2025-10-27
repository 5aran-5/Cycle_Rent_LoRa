from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users (is_staff=True)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsRegularUser(permissions.BasePermission):
    """Allows access only to normal (non-admin) users."""
    def has_permission(self, request, view):
        return bool(request.user and not request.user.is_staff)
