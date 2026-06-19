from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import serializers

from users.models import UserProfile

from .models import (
    Artifact,
    CartItem,
    Category,
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


class ArtifactSerializer(serializers.ModelSerializer):
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

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
            'model_3d',
            'textures_path',
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
        email = validated_data.get('email')

        if email:
            validated_data['username'] = email

        user = super().update(instance, validated_data)

        if role and getattr(user.profile, 'role', None) != role:
            user.profile.role = role
            user.profile.save(update_fields=['role'])

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
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'buyer', 'buyer_email', 'total_amount', 'status', 'created_at', 'items')
        read_only_fields = ('id', 'buyer', 'buyer_email', 'total_amount', 'status', 'created_at', 'items')


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
