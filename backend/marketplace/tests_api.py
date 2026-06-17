from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import UserProfile

from .models import Artifact, CartItem, Category, Order, WishlistItem

User = get_user_model()


class MarketplaceApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Furniture')
        self.wishlist_category = Category.objects.create(name='Decor')
        self.seller = User.objects.create_user(
            username='seller-api@example.com',
            email='seller-api@example.com',
            password='strong-password-123',
        )
        self.seller.profile.role = UserProfile.Role.SELLER
        self.seller.profile.save(update_fields=['role'])
        self.admin = User.objects.create_user(
            username='admin-api@example.com',
            email='admin-api@example.com',
            password='strong-password-123',
        )
        self.admin.profile.role = UserProfile.Role.ADMIN
        self.admin.profile.save(update_fields=['role'])
        self.buyer = User.objects.create_user(
            username='buyer-api@example.com',
            email='buyer-api@example.com',
            password='strong-password-123',
        )
        self.buyer.profile.role = UserProfile.Role.BUYER
        self.buyer.profile.save(update_fields=['role'])

    def test_public_artifact_list_only_shows_approved_items(self):
        Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Approved Lamp',
            description='Visible antique lamp.',
            price=Decimal('400.00'),
            status=Artifact.Status.APPROVED,
        )
        Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Draft Chair',
            description='Hidden draft chair.',
            price=Decimal('900.00'),
            status=Artifact.Status.DRAFT,
        )

        response = self.client.get('/api/artifacts/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = {artifact['title'] for artifact in response.data}
        self.assertEqual(titles, {'Approved Lamp'})

    def test_seller_can_create_artifact_but_status_stays_read_only(self):
        self.client.force_authenticate(self.seller)

        response = self.client.post(
            '/api/artifacts/',
            {
                'category': self.category.id,
                'title': 'Seller Cabinet',
                'description': 'Walnut cabinet with carved panels.',
                'price': '1500.00',
                'status': Artifact.Status.APPROVED,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        artifact = Artifact.objects.get(title='Seller Cabinet')
        self.assertEqual(artifact.seller, self.seller)
        self.assertEqual(artifact.status, Artifact.Status.DRAFT)

    def test_admin_can_update_artifact_status(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Pending Table',
            description='Small side table awaiting validation.',
            price=Decimal('750.00'),
            status=Artifact.Status.PENDING,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f'/api/artifacts/{artifact.id}/',
            {'status': Artifact.Status.APPROVED},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        artifact.refresh_from_db()
        self.assertEqual(artifact.status, Artifact.Status.APPROVED)

    def test_buyer_can_manage_wishlist(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.wishlist_category,
            title='Wishlist Mirror',
            description='Decorative mirror for the wishlist.',
            price=Decimal('300.00'),
            status=Artifact.Status.APPROVED,
        )
        self.client.force_authenticate(self.buyer)

        create_response = self.client.post(
            '/api/wishlist/',
            {'artifact': artifact.id},
            format='json',
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WishlistItem.objects.filter(user=self.buyer).count(), 1)

        list_response = self.client.get('/api/wishlist/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['artifact_detail']['title'], 'Wishlist Mirror')

        delete_response = self.client.delete(f"/api/wishlist/{create_response.data['id']}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(WishlistItem.objects.filter(user=self.buyer).count(), 0)

    def test_buyer_can_update_cart_and_checkout(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Checkout Cabinet',
            description='Cabinet for checkout flow.',
            price=Decimal('1250.00'),
            status=Artifact.Status.APPROVED,
        )
        self.client.force_authenticate(self.buyer)

        create_response = self.client.post(
            '/api/cart/',
            {'artifact': artifact.id, 'quantity': 2},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data['quantity'], 2)

        cart_item = CartItem.objects.get(user=self.buyer, artifact=artifact)

        update_response = self.client.patch(
            f'/api/cart/{cart_item.id}/',
            {'quantity': 3},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 3)

        checkout_response = self.client.post('/api/orders/checkout/', {}, format='json')
        self.assertEqual(checkout_response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(pk=checkout_response.data['id'])
        self.assertEqual(order.total_amount, Decimal('3750.00'))
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().quantity, 3)
        self.assertFalse(CartItem.objects.filter(user=self.buyer).exists())

    def test_checkout_rejects_unavailable_artifacts(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Unavailable Chair',
            description='Draft chair should not pass checkout.',
            price=Decimal('800.00'),
            status=Artifact.Status.DRAFT,
        )
        CartItem.objects.create(user=self.buyer, artifact=artifact, quantity=1)
        self.client.force_authenticate(self.buyer)

        response = self.client.post('/api/orders/checkout/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(CartItem.objects.filter(user=self.buyer).exists())

    def test_payment_simulation_updates_order_status(self):
        artifact = Artifact.objects.create(
            seller=self.seller,
            category=self.category,
            title='Payment Lamp',
            description='Lamp for payment simulation.',
            price=Decimal('500.00'),
            status=Artifact.Status.APPROVED,
        )
        CartItem.objects.create(user=self.buyer, artifact=artifact, quantity=1)
        self.client.force_authenticate(self.buyer)

        checkout_response = self.client.post('/api/orders/checkout/', {}, format='json')
        order_id = checkout_response.data['id']

        failure_response = self.client.post(
            f'/api/orders/{order_id}/simulate_payment/',
            {'success': False},
            format='json',
        )
        self.assertEqual(failure_response.status_code, status.HTTP_200_OK)
        self.assertEqual(failure_response.data['status'], Order.Status.FAILED)

        success_response = self.client.post(
            f'/api/orders/{order_id}/simulate_payment/',
            {'success': True},
            format='json',
        )
        self.assertEqual(success_response.status_code, status.HTTP_200_OK)
        self.assertEqual(success_response.data['status'], Order.Status.PAID)
        artifact.refresh_from_db()
        self.assertEqual(artifact.status, Artifact.Status.SOLD)
