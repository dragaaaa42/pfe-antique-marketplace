from django.contrib import admin
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


class ExhibitInline(admin.TabularInline):
    model = Exhibit
    extra = 0


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ('name',)


@admin.register(Artifact)
class ArtifactAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'category', 'price', 'condition', 'status', 'created_at')
    list_filter = ('status', 'condition', 'category')
    search_fields = ('title', 'description', 'history', 'provenance', 'seller__email')


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'theme', 'is_public', 'created_at')
    list_filter = ('is_public', 'theme')
    search_fields = ('name', 'theme', 'description', 'owner__email')
    inlines = (ExhibitInline,)


@admin.register(Exhibit)
class ExhibitAdmin(admin.ModelAdmin):
    list_display = ('gallery', 'artifact', 'position_x', 'position_y', 'position_z', 'scale')
    list_filter = ('gallery',)
    search_fields = ('gallery__name', 'artifact__title')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('buyer__email',)
    inlines = (OrderItemInline,)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'artifact', 'quantity', 'price')
    search_fields = ('artifact__title', 'order__buyer__email')


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'artifact', 'created_at')
    search_fields = ('user__email', 'artifact__title')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'artifact', 'quantity', 'updated_at')
    search_fields = ('user__email', 'artifact__title')


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'admin', 'target_model', 'target_id', 'created_at')
    list_filter = ('action_type', 'target_model')
    search_fields = ('admin__email', 'target_label', 'notes')
