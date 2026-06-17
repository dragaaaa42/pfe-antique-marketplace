from rest_framework import serializers

from .models import Artifact, Category, Exhibit, Gallery, Order, OrderItem


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


class OrderItemSerializer(serializers.ModelSerializer):
    artifact_title = serializers.CharField(source='artifact.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'order', 'artifact', 'artifact_title', 'price')
        read_only_fields = ('id', 'order', 'artifact_title', 'price')


class OrderSerializer(serializers.ModelSerializer):
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'buyer', 'buyer_email', 'total_amount', 'status', 'created_at', 'items')
        read_only_fields = ('id', 'buyer', 'buyer_email', 'total_amount', 'status', 'created_at', 'items')
