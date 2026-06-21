from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ('name',)
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Artifact(models.Model):
    class Condition(models.TextChoices):
        EXCELLENT = 'excellent', 'Excellent'
        GOOD = 'good', 'Good'
        FAIR = 'fair', 'Fair'
        RESTORED = 'restored', 'Restored'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING = 'pending', 'Pending validation'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        SOLD = 'sold', 'Sold'

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='artifacts',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='artifacts',
    )
    title = models.CharField(max_length=180)
    description = models.TextField()
    history = models.TextField(blank=True)
    provenance = models.TextField(blank=True)
    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.GOOD,
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='artifacts/images/', blank=True)
    model_3d = models.FileField(upload_to='artifacts/models/', blank=True)
    textures_path = models.CharField(max_length=255, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.title


class Gallery(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='galleries',
    )
    name = models.CharField(max_length=160)
    theme = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    layout_3d_path = models.CharField(max_length=255, blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name_plural = 'galleries'

    def __str__(self):
        return self.name


class Exhibit(models.Model):
    gallery = models.ForeignKey(
        Gallery,
        on_delete=models.CASCADE,
        related_name='exhibits',
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='exhibits',
    )
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    position_z = models.FloatField(default=0)
    rotation_y = models.FloatField(default=0)
    scale = models.FloatField(default=1)
    label = models.CharField(max_length=160, blank=True)
    has_spotlight = models.BooleanField(default=False)

    class Meta:
        ordering = ('gallery', 'id')
        unique_together = ('gallery', 'artifact')

    def __str__(self):
        return f'{self.artifact} in {self.gallery}'


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'Order #{self.pk} - {self.buyer}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.PROTECT,
        related_name='order_items',
    )
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('order', 'artifact')

    def __str__(self):
        return f'{self.artifact} - {self.price}'


class WishlistItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items',
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='wishlist_items',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        unique_together = ('user', 'artifact')

    def __str__(self):
        return f'{self.artifact} saved by {self.user}'


class CartItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-updated_at',)
        unique_together = ('user', 'artifact')

    def __str__(self):
        return f'{self.quantity} x {self.artifact} in cart for {self.user}'


class Conversation(models.Model):
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='conversations',
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='buyer_conversations',
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='seller_conversations',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-updated_at', '-created_at')
        unique_together = ('artifact', 'buyer', 'seller')

    def __str__(self):
        return f'Conversation #{self.pk} for {self.artifact}'


class ConversationMessage(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_conversation_messages',
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ('created_at', 'id')

    def __str__(self):
        return f'Message #{self.pk} in conversation #{self.conversation_id}'


class ModerationAction(models.Model):
    class ActionType(models.TextChoices):
        ARTIFACT_APPROVED = 'artifact_approved', 'Artifact approved'
        ARTIFACT_REJECTED = 'artifact_rejected', 'Artifact rejected'
        ARTIFACT_DELETED = 'artifact_deleted', 'Artifact deleted'
        GALLERY_DELETED = 'gallery_deleted', 'Gallery deleted'
        USER_ROLE_CHANGED = 'user_role_changed', 'User role changed'
        USER_DISABLED = 'user_disabled', 'User disabled'
        USER_ENABLED = 'user_enabled', 'User enabled'

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='moderation_actions',
    )
    action_type = models.CharField(max_length=40, choices=ActionType.choices)
    target_model = models.CharField(max_length=40)
    target_id = models.PositiveIntegerField()
    target_label = models.CharField(max_length=180, blank=True)
    notes = models.TextField(blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.action_type} by {self.admin} on {self.target_model} #{self.target_id}'
