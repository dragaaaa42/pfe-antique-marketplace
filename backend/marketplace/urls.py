from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminArtifactViewSet,
    AdminAuditTrailViewSet,
    AdminDashboardView,
    AdminGalleryViewSet,
    AdminUserViewSet,
    ArtifactImageDeleteView,
    ArtifactViewSet,
    CartViewSet,
    CategoryViewSet,
    ConversationViewSet,
    CollectorDashboardView,
    ExhibitViewSet,
    GalleryViewSet,
    OrderViewSet,
    SellerArtifactViewSet,
    SellerDashboardView,
    SellerOrderViewSet,
    SellerGalleryViewSet,
    WishlistViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('artifacts', ArtifactViewSet, basename='artifact')
router.register('galleries', GalleryViewSet, basename='gallery')
router.register('exhibits', ExhibitViewSet, basename='exhibit')
router.register('orders', OrderViewSet, basename='order')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('cart', CartViewSet, basename='cart')
router.register('conversations', ConversationViewSet, basename='conversation')

seller_router = DefaultRouter()
seller_router.register('artifacts', SellerArtifactViewSet, basename='seller-artifact')
seller_router.register('galleries', SellerGalleryViewSet, basename='seller-gallery')

admin_router = DefaultRouter()
admin_router.register('users', AdminUserViewSet, basename='admin-user')
admin_router.register('artifacts', AdminArtifactViewSet, basename='admin-artifact')
admin_router.register('galleries', AdminGalleryViewSet, basename='admin-gallery')
admin_router.register('audit-trail', AdminAuditTrailViewSet, basename='admin-audit-trail')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/', include(admin_router.urls)),
    path('seller/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('collector/dashboard/', CollectorDashboardView.as_view(), name='collector-dashboard'),
    path('seller/orders/', SellerOrderViewSet.as_view({'get': 'list'}), name='seller-orders'),
    path('seller/orders/<int:pk>/', SellerOrderViewSet.as_view({'get': 'retrieve'}), name='seller-order-detail'),
    path('seller/', include(seller_router.urls)),
    path('artifact-images/<int:pk>/', ArtifactImageDeleteView.as_view(), name='artifact-image-delete'),
]
