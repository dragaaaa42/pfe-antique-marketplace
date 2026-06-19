from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile

User = get_user_model()


class AuthApiTests(APITestCase):
    def test_register_creates_user_profile_with_role(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'email': 'seller@example.com',
                'password': 'strong-password-123',
                'role': UserProfile.Role.SELLER,
                'first_name': 'Mina',
                'last_name': 'Seller',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='seller@example.com')
        self.assertEqual(user.profile.role, UserProfile.Role.SELLER)
        self.assertEqual(response.data['role'], UserProfile.Role.SELLER)

    def test_register_rejects_admin_role(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'email': 'admin@example.com',
                'password': 'strong-password-123',
                'role': UserProfile.Role.ADMIN,
                'first_name': 'Ada',
                'last_name': 'Admin',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='admin@example.com').exists())

    def test_login_returns_tokens_and_me_returns_user(self):
        user = User.objects.create_user(
            username='buyer@example.com',
            email='buyer@example.com',
            password='strong-password-123',
        )
        user.profile.role = UserProfile.Role.BUYER
        user.profile.save(update_fields=['role'])

        login_response = self.client.post(
            '/api/auth/login/',
            {
                'email': 'buyer@example.com',
                'password': 'strong-password-123',
            },
            format='json',
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)
        self.assertEqual(login_response.data['user']['role'], UserProfile.Role.BUYER)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")
        me_response = self.client.get('/api/auth/me/')

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['email'], 'buyer@example.com')
        self.assertEqual(me_response.data['role'], UserProfile.Role.BUYER)

    def test_me_endpoint_supports_profile_updates(self):
        user = User.objects.create_user(
            username='collector@example.com',
            email='collector@example.com',
            password='strong-password-123',
            first_name='Old',
            last_name='Name',
        )
        user.profile.role = UserProfile.Role.BUYER
        user.profile.avatar_3d_path = '/avatars/old.glb'
        user.profile.save(update_fields=['role', 'avatar_3d_path'])

        self.client.force_authenticate(user)
        response = self.client.patch(
            '/api/auth/me/',
            {
                'email': 'new-collector@example.com',
                'first_name': 'New',
                'last_name': 'Collector',
                'avatar_3d_path': '/avatars/new.glb',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        user.profile.refresh_from_db()
        self.assertEqual(user.email, 'new-collector@example.com')
        self.assertEqual(user.username, 'new-collector@example.com')
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.profile.avatar_3d_path, '/avatars/new.glb')

    def test_change_password_updates_credentials(self):
        user = User.objects.create_user(
            username='password@example.com',
            email='password@example.com',
            password='old-password-123',
        )
        user.profile.role = UserProfile.Role.BUYER
        user.profile.save(update_fields=['role'])

        self.client.force_authenticate(user)
        response = self.client.post(
            '/api/auth/change-password/',
            {
                'current_password': 'old-password-123',
                'new_password': 'new-password-123',
                'confirm_password': 'new-password-123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('new-password-123'))
