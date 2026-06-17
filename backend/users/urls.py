from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AuthStatusView, LoginView, MeView, RegisterView

urlpatterns = [
    path('', AuthStatusView.as_view(), name='auth-status'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
]
