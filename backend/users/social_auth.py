import json
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile

User = get_user_model()

SOCIAL_STATE_SALT = 'users.social-auth'


class SocialAuthError(Exception):
    pass


def get_provider_settings(provider: str) -> dict[str, str]:
    configs = {
        'google': {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
        },
        'github': {
            'client_id': settings.GITHUB_OAUTH_CLIENT_ID,
            'client_secret': settings.GITHUB_OAUTH_CLIENT_SECRET,
        },
    }
    try:
        config = configs[provider]
    except KeyError as exc:
        raise SocialAuthError('Unsupported social provider.') from exc

    if not config['client_id'] or not config['client_secret']:
        raise SocialAuthError(f'{provider.title()} social login is not configured yet.')

    return config


def get_backend_callback_url(provider: str) -> str:
    return f"{settings.BACKEND_URL.rstrip('/')}{reverse(f'auth-social-{provider}-callback')}"


def get_frontend_callback_url() -> str:
    return f"{settings.FRONTEND_URL.rstrip('/')}/auth/callback"


def build_frontend_redirect_url(params: dict[str, str]) -> str:
    query = urllib.parse.urlencode({key: value for key, value in params.items() if value})
    return f'{get_frontend_callback_url()}#{query}'


def encode_state(payload: dict[str, str]) -> str:
    return signing.dumps(payload, salt=SOCIAL_STATE_SALT)


def decode_state(value: str) -> dict[str, str]:
    try:
        decoded = signing.loads(value, salt=SOCIAL_STATE_SALT, max_age=600)
    except signing.BadSignature as exc:
        raise SocialAuthError('Social login session expired. Please try again.') from exc
    return {key: str(item) for key, item in decoded.items()}


def post_form(url: str, data: dict[str, str], headers: dict[str, str] | None = None) -> dict:
    body = urllib.parse.urlencode(data).encode('utf-8')
    request = urllib.request.Request(url, data=body, headers=headers or {}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='ignore')
        raise SocialAuthError(f'Social login request failed: {detail or exc.reason}') from exc
    except urllib.error.URLError as exc:
        raise SocialAuthError('Could not reach the social login provider.') from exc


def get_json(url: str, headers: dict[str, str] | None = None) -> dict:
    request = urllib.request.Request(url, headers=headers or {}, method='GET')
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='ignore')
        raise SocialAuthError(f'Social login request failed: {detail or exc.reason}') from exc
    except urllib.error.URLError as exc:
        raise SocialAuthError('Could not reach the social login provider.') from exc


def split_name(full_name: str) -> tuple[str, str]:
    cleaned = (full_name or '').strip()
    if not cleaned:
        return '', ''
    parts = cleaned.split()
    if len(parts) == 1:
        return parts[0], ''
    return parts[0], ' '.join(parts[1:])


def get_or_create_social_user(
    *,
    email: str,
    first_name: str,
    last_name: str,
    role: str,
    create_if_missing: bool,
) -> User:
    normalized_email = email.strip().lower()
    user = User.objects.filter(email__iexact=normalized_email).first()

    if user is None and not create_if_missing:
        raise SocialAuthError('No account exists for this social login yet. Please sign up first.')

    if user is None:
        safe_role = role if role in {UserProfile.Role.BUYER, UserProfile.Role.SELLER} else UserProfile.Role.BUYER
        user = User.objects.create_user(
            username=normalized_email,
            email=normalized_email,
            password=None,
            first_name=first_name,
            last_name=last_name,
        )
        user.profile.role = safe_role
        user.profile.save(update_fields=['role'])
        return user

    updated_fields: list[str] = []
    if first_name and not user.first_name:
        user.first_name = first_name
        updated_fields.append('first_name')
    if last_name and not user.last_name:
        user.last_name = last_name
        updated_fields.append('last_name')
    if updated_fields:
        user.save(update_fields=updated_fields)

    return user


def issue_auth_payload(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    refresh['email'] = user.email
    refresh['role'] = getattr(user.profile, 'role', UserProfile.Role.BUYER)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def build_provider_authorize_url(provider: str, state: str) -> str:
    config = get_provider_settings(provider)
    redirect_uri = get_backend_callback_url(provider)

    if provider == 'google':
        query = urllib.parse.urlencode(
            {
                'client_id': config['client_id'],
                'redirect_uri': redirect_uri,
                'response_type': 'code',
                'scope': 'openid email profile',
                'state': state,
                'prompt': 'select_account',
            }
        )
        return f'https://accounts.google.com/o/oauth2/v2/auth?{query}'

    if provider == 'github':
        query = urllib.parse.urlencode(
            {
                'client_id': config['client_id'],
                'redirect_uri': redirect_uri,
                'scope': 'read:user user:email',
                'state': state,
            }
        )
        return f'https://github.com/login/oauth/authorize?{query}'

    raise SocialAuthError('Unsupported social provider.')


def authenticate_with_google(code: str) -> dict[str, str]:
    config = get_provider_settings('google')
    token_data = post_form(
        'https://oauth2.googleapis.com/token',
        {
            'code': code,
            'client_id': config['client_id'],
            'client_secret': config['client_secret'],
            'redirect_uri': get_backend_callback_url('google'),
            'grant_type': 'authorization_code',
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    access_token = token_data.get('access_token')
    if not access_token:
        raise SocialAuthError('Google did not return an access token.')

    profile = get_json(
        'https://openidconnect.googleapis.com/v1/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
    )
    email = profile.get('email')
    if not email:
        raise SocialAuthError('Google account did not provide an email address.')

    return {
        'email': str(email).lower(),
        'first_name': str(profile.get('given_name') or ''),
        'last_name': str(profile.get('family_name') or ''),
    }


def authenticate_with_github(code: str) -> dict[str, str]:
    config = get_provider_settings('github')
    token_data = post_form(
        'https://github.com/login/oauth/access_token',
        {
            'code': code,
            'client_id': config['client_id'],
            'client_secret': config['client_secret'],
            'redirect_uri': get_backend_callback_url('github'),
        },
        headers={
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    )
    access_token = token_data.get('access_token')
    if not access_token:
        raise SocialAuthError('GitHub did not return an access token.')

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'artisan-echo-social-auth',
    }
    profile = get_json('https://api.github.com/user', headers=headers)
    emails = get_json('https://api.github.com/user/emails', headers=headers)

    primary_email = next(
        (
            item.get('email')
            for item in emails
            if item.get('verified') and (item.get('primary') or item.get('visibility') == 'public')
        ),
        None,
    )
    if primary_email is None:
        primary_email = next((item.get('email') for item in emails if item.get('verified')), None)
    if primary_email is None:
        raise SocialAuthError('GitHub account does not have a verified email address.')

    first_name, last_name = split_name(str(profile.get('name') or ''))
    return {
        'email': str(primary_email).lower(),
        'first_name': first_name,
        'last_name': last_name,
    }
