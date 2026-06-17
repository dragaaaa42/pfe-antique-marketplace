from rest_framework.permissions import SAFE_METHODS, BasePermission


def user_role(user):
    if not user or not user.is_authenticated:
        return None
    return getattr(getattr(user, 'profile', None), 'role', None)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return user_role(request.user) == 'admin'


class IsSellerOrAdminForWrites(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return user_role(request.user) in ('seller', 'admin')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if user_role(request.user) == 'admin':
            return True
        owner = getattr(obj, 'seller', getattr(obj, 'owner', None))
        return owner == request.user


class IsGalleryOwnerOrAdminForWrites(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return user_role(request.user) in ('seller', 'admin')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if user_role(request.user) == 'admin':
            return True
        gallery = getattr(obj, 'gallery', obj)
        return getattr(gallery, 'owner', None) == request.user


class IsBuyerOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if user_role(request.user) == 'admin':
            return True
        return obj.buyer == request.user
