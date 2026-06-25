from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from users.models import UserProfile

from .models import (
    Artifact,
    ArtifactImage,
    CartItem,
    Category,
    Conversation,
    ConversationMessage,
    Exhibit,
    Gallery,
    ModerationAction,
    Order,
    OrderItem,
    WishlistItem,
)

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description')


class ArtifactImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifactImage
        fields = ('id', 'image', 'order')


class ArtifactSerializer(serializers.ModelSerializer):
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    gallery_images = ArtifactImageSerializer(many=True, read_only=True)

    class Meta:
        model = Artifact
        fields = (
            'id',
            'seller',
            'seller_email',
            'category',
            'category_name',
            'title',
            'description',
            'history',
            'provenance',
            'condition',
            'price',
            'image',
            'gallery_images',
            'model_3d',
            'textures_path',
            'materials',
            'dimensions',
            'metadata_json',
            'status',
            'created_at',
        )
        read_only_fields = ('id', 'seller', 'seller_email', 'category_name', 'status', 'created_at')


class AdminArtifactSerializer(ArtifactSerializer):
    class Meta(ArtifactSerializer.Meta):
        read_only_fields = ('id', 'seller', 'seller_email', 'category_name', 'created_at')


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(source='profile.role', choices=UserProfile.Role.choices)
    is_suspended = serializers.BooleanField(source='profile.is_suspended', required=False)
    is_verified = serializers.BooleanField(source='profile.is_verified', required=False)
    is_deleted = serializers.BooleanField(source='profile.is_deleted', required=False)
    profile_created_at = serializers.DateTimeField(source='profile.created_at', read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'date_joined',
            'role',
            'is_suspended',
            'is_verified',
            'is_deleted',
            'profile_created_at',
        )
        read_only_fields = ('id', 'username', 'date_joined', 'profile_created_at')

    def validate_email(self, value):
        email = value.strip().lower()
        if self.instance and User.objects.exclude(pk=self.instance.pk).filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        role = profile_data.get('role')
        is_suspended = profile_data.get('is_suspended')
        is_verified = profile_data.get('is_verified')
        is_deleted = profile_data.get('is_deleted')
        email = validated_data.get('email')

        if email:
            validated_data['username'] = email

        user = super().update(instance, validated_data)
        profile = user.profile
        save_fields = []

        if role is not None and profile.role != role:
            profile.role = role
            save_fields.append('role')

        if is_suspended is not None and profile.is_suspended != is_suspended:
            profile.is_suspended = is_suspended
            save_fields.append('is_suspended')

        if is_verified is not None and profile.is_verified != is_verified:
            profile.is_verified = is_verified
            save_fields.append('is_verified')

        if is_deleted is not None and profile.is_deleted != is_deleted:
            profile.is_deleted = is_deleted
            save_fields.append('is_deleted')

        if save_fields:
            profile.save(update_fields=save_fields)

        return user


class ExhibitSerializer(serializers.ModelSerializer):
    artifact_title = serializers.CharField(source='artifact.title', read_only=True)

    class Meta:
        model = Exhibit
        fields = (
            'id',
            'gallery',
            'artifact',
            'artifact_title',
            'position_x',
            'position_y',
            'position_z',
            'rotation_y',
            'scale',
            'label',
            'has_spotlight',
        )


class GallerySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    exhibits = ExhibitSerializer(many=True, read_only=True)

    class Meta:
        model = Gallery
        fields = (
            'id',
            'owner',
            'owner_email',
            'name',
            'theme',
            'description',
            'layout_3d_path',
            'is_public',
            'created_at',
            'exhibits',
        )
        read_only_fields = ('id', 'owner', 'owner_email', 'created_at', 'exhibits')


class ModerationActionSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(source='admin.email', read_only=True)

    class Meta:
        model = ModerationAction
        fields = (
            'id',
            'admin',
            'admin_email',
            'action_type',
            'target_model',
            'target_id',
            'target_label',
            'notes',
            'metadata_json',
            'created_at',
        )
        read_only_fields = (
            'id',
            'admin',
            'admin_email',
            'target_model',
            'target_id',
            'target_label',
            'notes',
            'metadata_json',
            'created_at',
        )


class OrderItemSerializer(serializers.ModelSerializer):
    artifact_title = serializers.CharField(source='artifact.title', read_only=True)
    artifact_detail = ArtifactSerializer(source='artifact', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'order',
            'artifact',
            'artifact_title',
            'artifact_detail',
            'quantity',
            'price',
            'subtotal',
        )
        read_only_fields = ('id', 'order', 'artifact_title', 'artifact_detail', 'subtotal')

    def get_subtotal(self, obj):
        return str(Decimal(obj.price) * obj.quantity)


class OrderSerializer(serializers.ModelSerializer):
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    buyer_first_name = serializers.CharField(source='buyer.first_name', read_only=True)
    buyer_last_name = serializers.CharField(source='buyer.last_name', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'buyer',
            'buyer_email',
            'buyer_first_name',
            'buyer_last_name',
            'seller',
            'total_amount',
            'status',
            'payment_method',
            'shipping_name',
            'shipping_phone',
            'shipping_city',
            'shipping_address',
            'shipping_notes',
            'created_at',
            'items',
        )
        read_only_fields = fields


class SellerOrderSerializer(serializers.ModelSerializer):
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    buyer_first_name = serializers.CharField(source='buyer.first_name', read_only=True)
    buyer_last_name = serializers.CharField(source='buyer.last_name', read_only=True)
    items = serializers.SerializerMethodField()
    seller_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'buyer',
            'buyer_email',
            'buyer_first_name',
            'buyer_last_name',
            'total_amount',
            'status',
            'payment_method',
            'shipping_name',
            'shipping_phone',
            'shipping_city',
            'shipping_address',
            'shipping_notes',
            'created_at',
            'items',
            'seller_revenue',
        )
        read_only_fields = fields

    def _seller_user(self):
        return self.context.get('seller_user')

    def get_items(self, obj):
        seller = self._seller_user()
        items = obj.items.select_related('artifact', 'artifact__category', 'artifact__seller').all()
        if seller and getattr(seller, 'profile', None) and seller.profile.role != UserProfile.Role.ADMIN:
            items = items.filter(artifact__seller=seller)
        return OrderItemSerializer(items, many=True, context=self.context).data

    def get_seller_revenue(self, obj):
        seller = self._seller_user()
        items = obj.items.select_related('artifact').all()
        if seller and getattr(seller, 'profile', None) and seller.profile.role != UserProfile.Role.ADMIN:
            items = items.filter(artifact__seller=seller)
        total = sum((Decimal(item.price) * item.quantity for item in items), Decimal('0.00'))
        return str(total)


class WishlistItemSerializer(serializers.ModelSerializer):
    artifact = serializers.PrimaryKeyRelatedField(
        queryset=Artifact.objects.select_related('category', 'seller').all(),
    )
    artifact_detail = ArtifactSerializer(source='artifact', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ('id', 'user', 'artifact', 'artifact_detail', 'created_at')
        read_only_fields = ('id', 'user', 'artifact_detail', 'created_at')

    def validate_artifact(self, artifact):
        if artifact.status != Artifact.Status.APPROVED:
            raise serializers.ValidationError('Only approved artifacts can be saved to a wishlist.')
        return artifact

    def create(self, validated_data):
        user = validated_data['user']
        artifact = validated_data['artifact']
        item, _ = WishlistItem.objects.get_or_create(user=user, artifact=artifact)
        return item


class CartItemSerializer(serializers.ModelSerializer):
    artifact = serializers.PrimaryKeyRelatedField(
        queryset=Artifact.objects.select_related('category', 'seller').all(),
    )
    artifact_detail = ArtifactSerializer(source='artifact', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'user', 'artifact', 'artifact_detail', 'quantity', 'subtotal', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'artifact_detail', 'subtotal', 'created_at', 'updated_at')

    def validate_artifact(self, artifact):
        if artifact.status != Artifact.Status.APPROVED:
            raise serializers.ValidationError('Only approved artifacts can be added to the cart.')
        return artifact

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def get_subtotal(self, obj):
        return str(Decimal(obj.artifact.price) * obj.quantity)

    def create(self, validated_data):
        user = validated_data['user']
        artifact = validated_data['artifact']
        quantity = validated_data.get('quantity', 1)
        item, created = CartItem.objects.get_or_create(
            user=user,
            artifact=artifact,
            defaults={'quantity': quantity},
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=['quantity', 'updated_at'])
        return item

    def update(self, instance, validated_data):
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.save(update_fields=['quantity', 'updated_at'])
        return instance


class ConversationMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_first_name = serializers.CharField(source='sender.first_name', read_only=True)
    sender_last_name = serializers.CharField(source='sender.last_name', read_only=True)
    sender_avatar_path = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()

    class Meta:
        model = ConversationMessage
        fields = (
            'id',
            'sender',
            'sender_email',
            'sender_username',
            'sender_first_name',
            'sender_last_name',
            'sender_avatar_path',
            'sender_role',
            'body',
            'created_at',
            'read_at',
        )
        read_only_fields = fields

    def get_sender_role(self, obj):
        return getattr(getattr(obj.sender, 'profile', None), 'role', UserProfile.Role.BUYER)

    def get_sender_avatar_path(self, obj):
        return getattr(getattr(obj.sender, 'profile', None), 'avatar_3d_path', '')


class ConversationListSerializer(serializers.ModelSerializer):
    artifact_detail = ArtifactSerializer(source='artifact', read_only=True)
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    buyer_first_name = serializers.CharField(source='buyer.first_name', read_only=True)
    buyer_last_name = serializers.CharField(source='buyer.last_name', read_only=True)
    buyer_avatar_path = serializers.SerializerMethodField()
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    seller_first_name = serializers.CharField(source='seller.first_name', read_only=True)
    seller_last_name = serializers.CharField(source='seller.last_name', read_only=True)
    seller_avatar_path = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id',
            'artifact',
            'artifact_detail',
            'buyer',
            'buyer_email',
            'buyer_username',
            'buyer_first_name',
            'buyer_last_name',
            'buyer_avatar_path',
            'seller',
            'seller_email',
            'seller_username',
            'seller_first_name',
            'seller_last_name',
            'seller_avatar_path',
            'created_at',
            'updated_at',
            'unread_count',
            'messages_count',
            'last_message_preview',
            'last_message_at',
        )
        read_only_fields = fields

    def _viewer(self):
        request = self.context.get('request')
        return getattr(request, 'user', None)

    def _last_message(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('messages')
        if prefetched:
            prefetched_messages = list(prefetched)
            return prefetched_messages[-1]
        return obj.messages.select_related('sender').order_by('created_at', 'id').last()

    def get_unread_count(self, obj):
        viewer = self._viewer()
        if not viewer or not viewer.is_authenticated:
            return 0
        return obj.messages.filter(read_at__isnull=True).exclude(sender=viewer).count()

    def get_buyer_avatar_path(self, obj):
        return getattr(getattr(obj.buyer, 'profile', None), 'avatar_3d_path', '')

    def get_seller_avatar_path(self, obj):
        return getattr(getattr(obj.seller, 'profile', None), 'avatar_3d_path', '')

    def get_messages_count(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('messages')
        if prefetched is not None:
            return len(prefetched)
        return obj.messages.count()

    def get_last_message_preview(self, obj):
        message = self._last_message(obj)
        if not message:
            return ''
        body = message.body.strip()
        return body if len(body) <= 140 else f'{body[:137]}...'

    def get_last_message_at(self, obj):
        message = self._last_message(obj)
        return message.created_at if message else obj.updated_at


class ConversationDetailSerializer(ConversationListSerializer):
    messages = ConversationMessageSerializer(many=True, read_only=True)

    class Meta(ConversationListSerializer.Meta):
        fields = ConversationListSerializer.Meta.fields + ('messages',)
        read_only_fields = fields


class ConversationCreateSerializer(serializers.Serializer):
    artifact = serializers.PrimaryKeyRelatedField(
        queryset=Artifact.objects.select_related('seller', 'category').all(),
    )
    body = serializers.CharField()

    def validate_artifact(self, artifact):
        if artifact.status != Artifact.Status.APPROVED:
            raise serializers.ValidationError('Only approved artifacts can receive a new conversation.')
        return artifact

    def validate_body(self, value):
        body = value.strip()
        if not body:
            raise serializers.ValidationError('Write a message before starting the conversation.')
        return body

    def validate(self, attrs):
        request = self.context['request']
        role = getattr(getattr(request.user, 'profile', None), 'role', None)

        if role != UserProfile.Role.BUYER:
            raise serializers.ValidationError({'detail': 'Only collector accounts can start a new seller conversation.'})

        artifact = attrs['artifact']
        if artifact.seller_id == request.user.id:
            raise serializers.ValidationError({'detail': 'You cannot start a conversation with your own listing.'})
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        artifact = validated_data['artifact']
        body = validated_data['body'].strip()
        conversation, _ = Conversation.objects.get_or_create(
            artifact=artifact,
            buyer=request.user,
            seller=artifact.seller,
        )
        ConversationMessage.objects.create(
            conversation=conversation,
            sender=request.user,
            body=body,
        )
        conversation.save(update_fields=['updated_at'])
        return conversation


class ConversationReplySerializer(serializers.Serializer):
    body = serializers.CharField()

    def validate_body(self, value):
        body = value.strip()
        if not body:
            raise serializers.ValidationError('Write a message before sending it.')
        return body

    def create(self, validated_data):
        conversation = self.context['conversation']
        sender = self.context['request'].user
        message = ConversationMessage.objects.create(
            conversation=conversation,
            sender=sender,
            body=validated_data['body'].strip(),
        )
        conversation.save(update_fields=['updated_at'])
        conversation.messages.exclude(sender=sender).filter(read_at__isnull=True).update(read_at=timezone.now())
        return message
