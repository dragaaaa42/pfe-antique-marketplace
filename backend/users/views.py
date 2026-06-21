from django.http import HttpResponseRedirect
from rest_framework import generics, permissions, response, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    ChangePasswordSerializer,
    CurrentUserSerializer,
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .social_auth import (
    SocialAuthError,
    authenticate_with_github,
    authenticate_with_google,
    build_frontend_redirect_url,
    build_provider_authorize_url,
    decode_state,
    encode_state,
    get_or_create_social_user,
    issue_auth_payload,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in {'PUT', 'PATCH'}:
            return CurrentUserSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance=self.get_object(), data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class AuthStatusView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'detail': 'Authentication API is ready.'})


class SocialAuthStartView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, provider: str):
        mode = request.GET.get('mode', 'login')
        role = request.GET.get('role', 'buyer')
        redirect_to = request.GET.get('redirect_to', '')

        if mode not in {'login', 'signup'}:
            return HttpResponseRedirect(build_frontend_redirect_url({'error': 'Unsupported social auth mode.'}))

        try:
            state = encode_state(
                {
                    'mode': mode,
                    'role': role,
                    'redirect_to': redirect_to,
                }
            )
            return HttpResponseRedirect(build_provider_authorize_url(provider, state))
        except SocialAuthError as exc:
            return HttpResponseRedirect(build_frontend_redirect_url({'error': str(exc)}))


class SocialAuthCallbackView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, provider: str):
        if request.GET.get('error'):
            return HttpResponseRedirect(
                build_frontend_redirect_url(
                    {'error': request.GET.get('error_description') or request.GET['error']}
                )
            )

        code = request.GET.get('code')
        state = request.GET.get('state')
        if not code or not state:
            return HttpResponseRedirect(build_frontend_redirect_url({'error': 'Social login did not return a code.'}))

        try:
            payload = decode_state(state)

            if provider == 'google':
                profile = authenticate_with_google(code)
            elif provider == 'github':
                profile = authenticate_with_github(code)
            else:
                raise SocialAuthError('Unsupported social provider.')

            user = get_or_create_social_user(
                email=profile['email'],
                first_name=profile['first_name'],
                last_name=profile['last_name'],
                role=payload.get('role', 'buyer'),
                create_if_missing=payload.get('mode') == 'signup',
            )
            auth_payload = issue_auth_payload(user)
            if payload.get('redirect_to'):
                auth_payload['redirect_to'] = payload['redirect_to']
            return HttpResponseRedirect(build_frontend_redirect_url(auth_payload))
        except SocialAuthError as exc:
            return HttpResponseRedirect(build_frontend_redirect_url({'error': str(exc)}))
