from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsBuyer
from users.permissions import IsAdminRole
from users.models import UserProfile

from .models import (
    Artifact,
    CartItem,
    Category,
    Conversation,
    Exhibit,
    Gallery,
    ModerationAction,
    Order,
    OrderItem,
    WishlistItem,
)
from .permissions import (
    IsAdminOrReadOnly,
    IsBuyerOwnedResource,
    IsBuyerOwnerOrAdmin,
    IsConversationParticipantOrAdmin,
    IsGalleryOwnerOrAdminForWrites,
    IsSellerOrAdminRole,
    IsSellerOwnedResource,
    IsSellerOrAdminForWrites,
    user_role,
)
from .serializers import (
    AdminArtifactSerializer,
    AdminUserSerializer,
    ArtifactSerializer,
    CartItemSerializer,
    CategorySerializer,
    ConversationCreateSerializer,
    ConversationDetailSerializer,
    ConversationListSerializer,
    ConversationReplySerializer,
    ExhibitSerializer,
    GallerySerializer,
    OrderSerializer,
    SellerOrderSerializer,
    ModerationActionSerializer,
    WishlistItemSerializer,
)

User = get_user_model()


def record_moderation_action(admin_user, action_type, target, *, notes='', metadata=None):
    return ModerationAction.objects.create(
        admin=admin_user,
        action_type=action_type,
        target_model=target._meta.model_name,
        target_id=target.pk,
        target_label=str(target),
        notes=notes or '',
        metadata_json=metadata or {},
    )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


class ArtifactViewSet(viewsets.ModelViewSet):
    permission_classes = (IsSellerOrAdminForWrites,)

    def get_queryset(self):
        queryset = Artifact.objects.select_related('seller', 'category').prefetch_related('gallery_images')
        role = user_role(self.request.user)

        if role == 'admin':
            return queryset
        if role == 'seller':
            if getattr(self, 'action', '') == 'retrieve':
                return queryset
            return queryset.filter(Q(status=Artifact.Status.APPROVED) | Q(seller=self.request.user))
            
        if getattr(self, 'action', '') == 'retrieve':
            return queryset
            
        return queryset.filter(status=Artifact.Status.APPROVED)

    def get_serializer_class(self):
        if user_role(self.request.user) == 'admin':
            return AdminArtifactSerializer
        return ArtifactSerializer

    def perform_create(self, serializer):
        artifact = serializer.save(seller=self.request.user)
        self._handle_gallery_images(artifact)

    def perform_update(self, serializer):
        artifact = serializer.save()
        self._handle_gallery_images(artifact)

    def _handle_gallery_images(self, artifact):
        from .models import ArtifactImage
        deleted_ids = self.request.data.getlist('deleted_gallery_images')
        if deleted_ids:
            ArtifactImage.objects.filter(artifact=artifact, id__in=deleted_ids).delete()
            
        images = self.request.FILES.getlist('gallery_images')
        for img in images:
            if artifact.gallery_images.count() < 3:
                ArtifactImage.objects.create(artifact=artifact, image=img)


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
        order_queryset = Order.objects.prefetch_related('items__artifact').select_related('buyer')
        conversation_queryset = Conversation.objects.select_related(
            'artifact',
            'artifact__category',
            'artifact__seller',
            'buyer',
            'buyer__profile',
            'seller',
            'seller__profile',
        ).prefetch_related('messages__sender', 'messages__sender__profile')
        role = user_role(request.user)

        if role != 'admin':
            artifact_queryset = artifact_queryset.filter(seller=request.user)
            gallery_queryset = gallery_queryset.filter(owner=request.user)
            order_queryset = order_queryset.filter(items__artifact__seller=request.user).distinct()
            conversation_queryset = conversation_queryset.filter(seller=request.user)

        sold_items = order_queryset.filter(status=Order.Status.PAID)
        seller_items = [
            item
            for order in sold_items
            for item in order.items.select_related('artifact').all()
            if role == 'admin' or item.artifact.seller_id == request.user.id
        ]
        revenue = sum(
            (Decimal(item.price) * item.quantity for item in seller_items),
            Decimal('0.00'),
        )
        stats = {
            'total_listings': artifact_queryset.count(),
            'published_listings': artifact_queryset.filter(status=Artifact.Status.APPROVED).count(),
            'pending_listings': artifact_queryset.filter(status=Artifact.Status.PENDING).count(),
            'sold_listings': artifact_queryset.filter(status=Artifact.Status.SOLD).count(),
            'total_galleries': gallery_queryset.count(),
            'total_sales': sum(item.quantity for item in seller_items),
            'revenue': str(revenue),
            'sold_artifacts': len({item.artifact_id for item in seller_items}),
            'open_conversations': conversation_queryset.count(),
            'unread_conversations': conversation_queryset.filter(messages__read_at__isnull=True)
            .exclude(messages__sender=request.user)
            .distinct()
            .count(),
        }

        recent_artifacts = artifact_queryset.order_by('-created_at')[:6]
        recent_galleries = gallery_queryset.order_by('-created_at')[:4]
        recent_orders = order_queryset.order_by('-created_at')[:5]
        recent_conversations = conversation_queryset.order_by('-updated_at')[:5]

        return Response(
            {
                'stats': stats,
                'recent_artifacts': ArtifactSerializer(recent_artifacts, many=True).data,
                'recent_galleries': GallerySerializer(recent_galleries, many=True).data,
                'recent_orders': SellerOrderSerializer(
                    recent_orders,
                    many=True,
                    context={'seller_user': request.user},
                ).data,
                'recent_conversations': ConversationListSerializer(
                    recent_conversations,
                    many=True,
                    context={'request': request},
                ).data,
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
        artifact = serializer.save(seller=self.request.user)
        self._handle_gallery_images(artifact)

    def perform_update(self, serializer):
        artifact = serializer.save()
        self._handle_gallery_images(artifact)

    def _handle_gallery_images(self, artifact):
        from .models import ArtifactImage
        deleted_ids = self.request.data.getlist('deleted_gallery_images')
        if deleted_ids:
            ArtifactImage.objects.filter(artifact=artifact, id__in=deleted_ids).delete()
            
        images = self.request.FILES.getlist('gallery_images')
        for img in images:
            if artifact.gallery_images.count() < 3:
                ArtifactImage.objects.create(artifact=artifact, image=img)


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


class SellerOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SellerOrderSerializer
    permission_classes = (IsSellerOrAdminRole,)

    def get_queryset(self):
        queryset = Order.objects.prefetch_related('items__artifact').select_related('buyer')
        role = user_role(self.request.user)

        if role == 'admin':
            return queryset

        return queryset.filter(items__artifact__seller=self.request.user).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['seller_user'] = self.request.user
        return context


class CollectorDashboardView(APIView):
    permission_classes = (IsBuyer,)

    def get(self, request):
        wishlist_queryset = WishlistItem.objects.select_related('artifact', 'artifact__category', 'artifact__seller')
        cart_queryset = CartItem.objects.select_related('artifact', 'artifact__category', 'artifact__seller')
        order_queryset = Order.objects.prefetch_related('items__artifact').select_related('buyer')

        wishlist_items = wishlist_queryset.filter(user=request.user).order_by('-created_at')
        cart_items = cart_queryset.filter(user=request.user).order_by('-updated_at')
        orders = order_queryset.filter(buyer=request.user).order_by('-created_at')

        recent_activity = [
            {
                'kind': 'wishlist',
                'label': item.artifact.title,
                'detail': item.artifact.category.name if item.artifact.category_id else 'Uncategorized',
                'created_at': item.created_at,
            }
            for item in wishlist_items[:3]
        ] + [
            {
                'kind': 'order',
                'label': f'Order #{order.id}',
                'detail': order.status,
                'created_at': order.created_at,
            }
            for order in orders[:3]
        ]

        recent_activity.sort(key=lambda item: item['created_at'], reverse=True)

        return Response(
            {
                'stats': {
                    'wishlist_count': wishlist_items.count(),
                    'cart_count': cart_items.count(),
                    'order_count': orders.count(),
                    'paid_orders': orders.filter(status=Order.Status.PAID).count(),
                },
                'profile': {
                    'id': request.user.id,
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'role': getattr(request.user.profile, 'role', UserProfile.Role.BUYER),
                    'avatar_3d_path': getattr(request.user.profile, 'avatar_3d_path', ''),
                    'created_at': getattr(request.user.profile, 'created_at', None),
                },
                'wishlist_items': WishlistItemSerializer(wishlist_items[:5], many=True).data,
                'recent_orders': OrderSerializer(orders[:5], many=True).data,
                'recent_activity': recent_activity[:6],
            }
        )


class AdminDashboardView(APIView):
    permission_classes = (IsAdminRole,)

    def get(self, request):
        recent_users = User.objects.select_related('profile').order_by('-date_joined')[:6]
        pending_artifacts = Artifact.objects.select_related('seller', 'category').filter(
            status=Artifact.Status.PENDING
        )[:6]
        recent_actions = ModerationAction.objects.select_related('admin').order_by('-created_at')[:8]
        recent_galleries = Gallery.objects.select_related('owner').order_by('-created_at')[:6]

        return Response(
            {
                'stats': {
                    'total_users': User.objects.count(),
                    'total_sellers': User.objects.filter(profile__role=UserProfile.Role.SELLER).count(),
                    'total_artifacts': Artifact.objects.count(),
                    'total_galleries': Gallery.objects.count(),
                    'total_orders': Order.objects.count(),
                    'pending_artifacts': Artifact.objects.filter(status=Artifact.Status.PENDING).count(),
                    'published_artifacts': Artifact.objects.filter(status=Artifact.Status.APPROVED).count(),
                },
                'recent_users': AdminUserSerializer(recent_users, many=True).data,
                'pending_artifacts': AdminArtifactSerializer(pending_artifacts, many=True).data,
                'recent_galleries': GallerySerializer(recent_galleries, many=True).data,
                'recent_actions': ModerationActionSerializer(recent_actions, many=True).data,
            }
        )


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdminRole,)
    http_method_names = ['get', 'patch', 'put', 'head', 'options']

    def get_queryset(self):
        queryset = User.objects.select_related('profile').order_by('email')
        search = self.request.query_params.get('search', '').strip()
        role = self.request.query_params.get('role', '').strip()
        active = self.request.query_params.get('is_active', '').strip().lower()

        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        if role in {UserProfile.Role.BUYER, UserProfile.Role.SELLER, UserProfile.Role.ADMIN}:
            queryset = queryset.filter(profile__role=role)

        if active in {'true', 'false'}:
            queryset = queryset.filter(is_active=active == 'true')

        return queryset

    def perform_update(self, serializer):
        instance = serializer.instance
        previous_role = getattr(instance.profile, 'role', None)
        previous_active = instance.is_active
        user = serializer.save()

        if getattr(user.profile, 'role', None) != previous_role:
            record_moderation_action(
                self.request.user,
                ModerationAction.ActionType.USER_ROLE_CHANGED,
                user,
                metadata={'from': previous_role, 'to': user.profile.role},
            )

        if user.is_active != previous_active:
            action_type = (
                ModerationAction.ActionType.USER_ENABLED
                if user.is_active
                else ModerationAction.ActionType.USER_DISABLED
            )
            record_moderation_action(
                self.request.user,
                action_type,
                user,
                metadata={'from': previous_active, 'to': user.is_active},
            )


class AdminArtifactViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdminArtifactSerializer
    permission_classes = (IsAdminRole,)

    def get_queryset(self):
        queryset = Artifact.objects.select_related('seller', 'category')
        status_filter = self.request.query_params.get('status', '').strip()
        search = self.request.query_params.get('search', '').strip()

        if status_filter in {choice[0] for choice in Artifact.Status.choices}:
            queryset = queryset.filter(status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(seller__email__icontains=search)
                | Q(category__name__icontains=search)
            )

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        artifact = self.get_object()
        if artifact.status == Artifact.Status.SOLD:
            raise ValidationError({'detail': 'Sold artifacts cannot be re-approved.'})

        artifact.status = Artifact.Status.APPROVED
        artifact.save(update_fields=['status'])
        record_moderation_action(self.request.user, ModerationAction.ActionType.ARTIFACT_APPROVED, artifact)
        return Response(self.get_serializer(artifact).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        artifact = self.get_object()
        if artifact.status == Artifact.Status.SOLD:
            raise ValidationError({'detail': 'Sold artifacts cannot be rejected.'})

        artifact.status = Artifact.Status.REJECTED
        artifact.save(update_fields=['status'])
        record_moderation_action(
            self.request.user,
            ModerationAction.ActionType.ARTIFACT_REJECTED,
            artifact,
            notes=request.data.get('notes', ''),
        )
        return Response(self.get_serializer(artifact).data)



class ArtifactImageDeleteView(APIView):
    """Allow sellers or admins to delete a gallery image by ID."""
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, pk=None):
        from .models import ArtifactImage
        try:
            img = ArtifactImage.objects.select_related('artifact__seller').get(pk=pk)
        except ArtifactImage.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        role = user_role(request.user)
        if role != 'admin' and img.artifact.seller_id != request.user.id:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminGalleryViewSet(viewsets.ModelViewSet):
    serializer_class = GallerySerializer
    permission_classes = (IsAdminRole,)
    http_method_names = ['get', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Gallery.objects.select_related('owner').prefetch_related('exhibits__artifact')
        search = self.request.query_params.get('search', '').strip()
        public_filter = self.request.query_params.get('is_public', '').strip().lower()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(theme__icontains=search)
                | Q(description__icontains=search)
                | Q(owner__email__icontains=search)
            )

        if public_filter in {'true', 'false'}:
            queryset = queryset.filter(is_public=public_filter == 'true')

        return queryset.order_by('-created_at')

    def perform_destroy(self, instance):
        record_moderation_action(self.request.user, ModerationAction.ActionType.GALLERY_DELETED, instance)
        instance.delete()


class AdminAuditTrailViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModerationActionSerializer
    permission_classes = (IsAdminRole,)

    def get_queryset(self):
        queryset = ModerationAction.objects.select_related('admin')
        action_type = self.request.query_params.get('action_type', '').strip()
        search = self.request.query_params.get('search', '').strip()

        if action_type in {choice[0] for choice in ModerationAction.ActionType.choices}:
            queryset = queryset.filter(action_type=action_type)

        if search:
            queryset = queryset.filter(
                Q(target_label__icontains=search)
                | Q(target_model__icontains=search)
                | Q(admin__email__icontains=search)
                | Q(notes__icontains=search)
            )

        return queryset.order_by('-created_at')


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


class ConversationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = (permissions.IsAuthenticated, IsConversationParticipantOrAdmin)

    def get_queryset(self):
        queryset = Conversation.objects.select_related(
            'artifact',
            'artifact__category',
            'artifact__seller',
            'buyer',
            'buyer__profile',
            'seller',
            'seller__profile',
        ).prefetch_related('messages__sender', 'messages__sender__profile')
        role = user_role(self.request.user)

        if role == 'admin':
            return queryset
        if role == 'seller':
            return queryset.filter(seller=self.request.user)
        if role == 'buyer':
            return queryset.filter(buyer=self.request.user)
        return queryset.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        if self.action == 'reply':
            return ConversationReplySerializer
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationListSerializer

    def get_queryset_filtered(self):
        queryset = self.get_queryset()
        artifact_id = self.request.query_params.get('artifact')
        if artifact_id:
            queryset = queryset.filter(artifact_id=artifact_id)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset_filtered()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        conversation = self.get_object()
        conversation.messages.exclude(sender=request.user).filter(read_at__isnull=True).update(read_at=timezone.now())
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        detail = ConversationDetailSerializer(conversation, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        conversation = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'conversation': conversation},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        refreshed = Conversation.objects.select_related(
            'artifact',
            'artifact__category',
            'artifact__seller',
            'buyer',
            'buyer__profile',
            'seller',
            'seller__profile',
        ).prefetch_related('messages__sender', 'messages__sender__profile').get(pk=conversation.pk)
        detail = ConversationDetailSerializer(refreshed, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
