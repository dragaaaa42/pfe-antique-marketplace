from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AuthStatusView,
    ChangePasswordView,
    LoginView,
    MeView,
    RegisterView,
    SocialAuthCallbackView,
    SocialAuthStartView,
)

urlpatterns = [
    path('', AuthStatusView.as_view(), name='auth-status'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('social/<str:provider>/start/', SocialAuthStartView.as_view(), name='auth-social-start'),
    path(
        'social/google/callback/',
        SocialAuthCallbackView.as_view(),
        {'provider': 'google'},
        name='auth-social-google-callback',
    ),
    path(
        'social/github/callback/',
        SocialAuthCallbackView.as_view(),
        {'provider': 'github'},
        name='auth-social-github-callback',
    ),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
]
