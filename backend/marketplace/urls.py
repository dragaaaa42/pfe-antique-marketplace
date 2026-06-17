from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ArtifactViewSet,
    CartViewSet,
    CategoryViewSet,
    ExhibitViewSet,
    GalleryViewSet,
    OrderViewSet,
    SellerArtifactViewSet,
    SellerDashboardView,
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

seller_router = DefaultRouter()
seller_router.register('artifacts', SellerArtifactViewSet, basename='seller-artifact')
seller_router.register('galleries', SellerGalleryViewSet, basename='seller-gallery')

urlpatterns = [
    path('', include(router.urls)),
    path('seller/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('seller/', include(seller_router.urls)),
]
