from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ArtifactViewSet, CategoryViewSet, ExhibitViewSet, GalleryViewSet, OrderViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('artifacts', ArtifactViewSet, basename='artifact')
router.register('galleries', GalleryViewSet, basename='gallery')
router.register('exhibits', ExhibitViewSet, basename='exhibit')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
