from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ArtifactViewSet,
    CartViewSet,
    CategoryViewSet,
    ExhibitViewSet,
    GalleryViewSet,
    OrderViewSet,
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

urlpatterns = [
    path('', include(router.urls)),
]
