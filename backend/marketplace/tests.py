from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Artifact, Category, Exhibit, Gallery, Order, OrderItem

User = get_user_model()


class MarketplaceModelTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            username='seller@example.com',
            email='seller@example.com',
            password='strong-password-123',
        )
        self.buyer = User.objects.create_user(
            username='buyer@example.com',
            email='buyer@example.com',
            password='strong-password-123',
        )
        self.category = Category.objects.create(
            name='Ceramics',
            description='Historic pottery and porcelain.',
        )

    def test_artifact_gallery_and_exhibit_relationships(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Blue Fes Vase',
            description='Hand-painted antique ceramic vase.',
            price=Decimal('1200.00'),
            status=Artifact.Status.PENDING,
        )
        gallery = Gallery.objects.create(
            owner=self.seller,
            name='Moroccan Ceramics Room',
            theme='Ceramics',
        )
        exhibit = Exhibit.objects.create(
            gallery=gallery,
            artifact=artifact,
            position_x=1.5,
            position_z=-2,
            scale=0.8,
        )

        self.assertEqual(gallery.exhibits.count(), 1)
        self.assertEqual(artifact.exhibits.first(), exhibit)

    def test_order_items_track_purchase_price(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Carved Cedar Chest',
            description='Restored cedar storage chest.',
            price=Decimal('2500.00'),
        )
        order = Order.objects.create(
            buyer=self.buyer,
            total_amount=artifact.price,
            status=Order.Status.PENDING,
        )
        item = OrderItem.objects.create(
            order=order,
            artifact=artifact,
            price=artifact.price,
        )

        self.assertEqual(order.items.count(), 1)
        self.assertEqual(item.price, Decimal('2500.00'))
