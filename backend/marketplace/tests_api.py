from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import UserProfile

from .models import Artifact, Category

User = get_user_model()


class MarketplaceApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Furniture')
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
