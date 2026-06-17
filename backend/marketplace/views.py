from django.db.models import Q
from rest_framework import permissions, viewsets

from .models import Artifact, Category, Exhibit, Gallery, Order
from .permissions import (
    IsAdminOrReadOnly,
    IsBuyerOwnerOrAdmin,
    IsGalleryOwnerOrAdminForWrites,
    IsSellerOrAdminForWrites,
    user_role,
)
from .serializers import (
    AdminArtifactSerializer,
    ArtifactSerializer,
    CategorySerializer,
    ExhibitSerializer,
    GallerySerializer,
    OrderSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


class ArtifactViewSet(viewsets.ModelViewSet):
    permission_classes = (IsSellerOrAdminForWrites,)

    def get_queryset(self):
        queryset = Artifact.objects.select_related('seller', 'category')
        role = user_role(self.request.user)

        if role == 'admin':
            return queryset
        if role == 'seller':
            return queryset.filter(Q(status=Artifact.Status.APPROVED) | Q(seller=self.request.user))
        return queryset.filter(status=Artifact.Status.APPROVED)

    def get_serializer_class(self):
        if user_role(self.request.user) == 'admin':
            return AdminArtifactSerializer
        return ArtifactSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class GalleryViewSet(viewsets.ModelViewSet):
    serializer_class = GallerySerializer
    permission_classes = (IsGalleryOwnerOrAdminForWrites,)

    def get_queryset(self):
        queryset = Gallery.objects.prefetch_related('exhibits__artifact').select_related('owner')
        role = user_role(self.request.user)

        if role == 'admin':
            return queryset
        if self.request.user.is_authenticated:
            return queryset.filter(Q(is_public=True) | Q(owner=self.request.user))
        return queryset.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ExhibitViewSet(viewsets.ModelViewSet):
    serializer_class = ExhibitSerializer
    permission_classes = (IsGalleryOwnerOrAdminForWrites,)

    def get_queryset(self):
        queryset = Exhibit.objects.select_related('gallery', 'gallery__owner', 'artifact')
        role = user_role(self.request.user)

        if role == 'admin':
            return queryset
        if self.request.user.is_authenticated:
            return queryset.filter(Q(gallery__is_public=True) | Q(gallery__owner=self.request.user))
        return queryset.filter(gallery__is_public=True)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsBuyerOwnerOrAdmin)

    def get_queryset(self):
        queryset = Order.objects.prefetch_related('items__artifact').select_related('buyer')
        if user_role(self.request.user) == 'admin':
            return queryset
        return queryset.filter(buyer=self.request.user)
