from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user.profile, 'role', None) in self.allowed_roles


class IsBuyer(HasRole):
    allowed_roles = ('buyer',)


class IsSeller(HasRole):
    allowed_roles = ('seller',)


class IsAdminRole(HasRole):
    allowed_roles = ('admin',)


class IsSellerOrAdmin(HasRole):
    allowed_roles = ('seller', 'admin')
