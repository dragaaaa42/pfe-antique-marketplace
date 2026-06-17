from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsBuyer

from .models import Artifact, CartItem, Category, Exhibit, Gallery, Order, OrderItem, WishlistItem
from .permissions import (
    IsAdminOrReadOnly,
    IsBuyerOwnedResource,
    IsBuyerOwnerOrAdmin,
    IsGalleryOwnerOrAdminForWrites,
    IsSellerOrAdminRole,
    IsSellerOwnedResource,
    IsSellerOrAdminForWrites,
    user_role,
)
from .serializers import (
    AdminArtifactSerializer,
    ArtifactSerializer,
    CartItemSerializer,
    CategorySerializer,
    ExhibitSerializer,
    GallerySerializer,
    OrderSerializer,
    WishlistItemSerializer,
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


class SellerDashboardView(APIView):
    permission_classes = (IsSellerOrAdminRole,)

    def get(self, request):
        artifact_queryset = Artifact.objects.select_related('seller', 'category')
        gallery_queryset = Gallery.objects.select_related('owner')
        role = user_role(request.user)

        if role != 'admin':
            artifact_queryset = artifact_queryset.filter(seller=request.user)
            gallery_queryset = gallery_queryset.filter(owner=request.user)

        stats = {
            'total_listings': artifact_queryset.count(),
            'published_listings': artifact_queryset.filter(status=Artifact.Status.APPROVED).count(),
            'pending_listings': artifact_queryset.filter(status=Artifact.Status.PENDING).count(),
            'sold_listings': artifact_queryset.filter(status=Artifact.Status.SOLD).count(),
            'total_galleries': gallery_queryset.count(),
        }

        recent_artifacts = artifact_queryset.order_by('-created_at')[:6]
        recent_galleries = gallery_queryset.order_by('-created_at')[:4]

        return Response(
            {
                'stats': stats,
                'recent_artifacts': ArtifactSerializer(recent_artifacts, many=True).data,
                'recent_galleries': GallerySerializer(recent_galleries, many=True).data,
            }
        )


class SellerArtifactViewSet(viewsets.ModelViewSet):
    serializer_class = ArtifactSerializer
    permission_classes = (IsSellerOwnedResource,)

    def get_queryset(self):
        queryset = Artifact.objects.select_related('seller', 'category')
        if user_role(self.request.user) == 'admin':
            return queryset
        return queryset.filter(seller=self.request.user)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class SellerGalleryViewSet(viewsets.ModelViewSet):
    serializer_class = GallerySerializer
    permission_classes = (IsSellerOwnedResource,)

    def get_queryset(self):
        queryset = Gallery.objects.select_related('owner').prefetch_related('exhibits__artifact')
        if user_role(self.request.user) == 'admin':
            return queryset
        return queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated, IsBuyerOwnedResource)

    def get_queryset(self):
        return (
            WishlistItem.objects.select_related('artifact', 'artifact__category', 'artifact__seller', 'user')
            .filter(user=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated, IsBuyerOwnedResource)

    def get_queryset(self):
        return (
            CartItem.objects.select_related('artifact', 'artifact__category', 'artifact__seller', 'user')
            .filter(user=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsBuyerOwnerOrAdmin)

    def get_permissions(self):
        if self.action in {'checkout', 'simulate_payment'}:
            return [permissions.IsAuthenticated(), IsBuyer()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Order.objects.prefetch_related('items__artifact').select_related('buyer')
        if user_role(self.request.user) == 'admin':
            return queryset
        return queryset.filter(buyer=self.request.user)

    def _validate_cart_items(self, cart_items):
        unavailable = [
            item.artifact.title
            for item in cart_items
            if item.artifact.status != Artifact.Status.APPROVED
        ]
        if unavailable:
            raise ValidationError(
                {'detail': f'These artifacts are no longer available: {", ".join(unavailable)}.'}
            )

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        cart_items = list(
            CartItem.objects.select_related('artifact')
            .filter(user=request.user)
            .order_by('created_at')
        )

        if not cart_items:
            raise ValidationError({'detail': 'Your cart is empty.'})

        self._validate_cart_items(cart_items)

        total_amount = Decimal('0.00')

        with transaction.atomic():
            order = Order.objects.create(
                buyer=request.user,
                total_amount=Decimal('0.00'),
                status=Order.Status.PENDING,
            )

            for item in cart_items:
                price = Decimal(item.artifact.price)
                total_amount += price * item.quantity
                OrderItem.objects.create(
                    order=order,
                    artifact=item.artifact,
                    quantity=item.quantity,
                    price=price,
                )

            order.total_amount = total_amount
            order.save(update_fields=['total_amount'])
            CartItem.objects.filter(user=request.user).delete()

        order.refresh_from_db()
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def simulate_payment(self, request, pk=None):
        order = self.get_object()
        success = request.data.get('success')

        if success is None:
            raise ValidationError({'success': 'Provide a boolean success flag.'})
        if order.status == Order.Status.PAID:
            raise ValidationError({'detail': 'This order is already paid.'})

        failure_message = None

        with transaction.atomic():
            order = self.get_object()
            items = list(order.items.select_related('artifact').all())

            if bool(success):
                unavailable = [
                    item.artifact.title
                    for item in items
                    if item.artifact.status != Artifact.Status.APPROVED
                ]
                if unavailable:
                    order.status = Order.Status.FAILED
                    order.save(update_fields=['status'])
                    failure_message = (
                        f'Payment failed because these artifacts are unavailable: {", ".join(unavailable)}.'
                    )
                else:
                    order.status = Order.Status.PAID
                    order.save(update_fields=['status'])
                    Artifact.objects.filter(order_items__order=order).update(status=Artifact.Status.SOLD)

            else:
                order.status = Order.Status.FAILED
                order.save(update_fields=['status'])

        order.refresh_from_db()
        if failure_message:
            return Response({'detail': failure_message, 'order': self.get_serializer(order).data}, status=400)
        return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)
