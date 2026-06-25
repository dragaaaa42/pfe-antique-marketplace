from django.contrib.auth import authenticate, get_user_model
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role', 'avatar_3d_path', 'created_at')
        read_only_fields = ('created_at',)


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile')
        read_only_fields = ('id', 'username', 'role', 'profile')


class CurrentUserSerializer(serializers.ModelSerializer):
    avatar_3d_path = serializers.CharField(
        source='profile.avatar_3d_path',
        required=False,
        allow_blank=True,
    )
    avatar_image = serializers.FileField(write_only=True, required=False, allow_null=True)
    remove_avatar = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'avatar_3d_path', 'avatar_image', 'remove_avatar')

    def validate_email(self, value):
        email = value.strip().lower()
        if self.instance and User.objects.exclude(pk=self.instance.pk).filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        avatar_3d_path = profile_data.get('avatar_3d_path')
        avatar_image = validated_data.pop('avatar_image', None)
        remove_avatar = validated_data.pop('remove_avatar', False)
        email = validated_data.get('email')

        if email:
            validated_data['username'] = email

        user = super().update(instance, validated_data)
        profile = user.profile

        if remove_avatar:
            self._delete_avatar_file(profile.avatar_3d_path)
            profile.avatar_3d_path = ''

        if avatar_3d_path is not None:
            profile.avatar_3d_path = avatar_3d_path

        if avatar_image is not None:
            self.validate_avatar_image(avatar_image)
            self._delete_avatar_file(profile.avatar_3d_path)
            saved_path = default_storage.save(f'avatars/{avatar_image.name}', avatar_image)
            profile.avatar_3d_path = f"{settings.BACKEND_URL.rstrip('/')}{default_storage.url(saved_path)}"

        profile.save(update_fields=['avatar_3d_path'])

        return user

    def validate_avatar_image(self, value):
        content_type = getattr(value, 'content_type', '')
        if content_type and not content_type.startswith('image/'):
            raise serializers.ValidationError('Upload an image file for the profile picture.')
        return value

    def _delete_avatar_file(self, path_value):
        if not path_value:
            return

        normalized = str(path_value).strip()
        backend_root = settings.BACKEND_URL.rstrip('/')
        if normalized.startswith(backend_root):
            normalized = normalized.replace(backend_root, '', 1)

        if not normalized.startswith('/media/avatars/'):
            return

        storage_path = normalized.replace('/media/', '', 1)
        if default_storage.exists(storage_path):
            default_storage.delete(storage_path)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=(
            (UserProfile.Role.BUYER, UserProfile.Role.BUYER),
            (UserProfile.Role.SELLER, UserProfile.Role.SELLER),
        ),
        default=UserProfile.Role.BUYER,
        write_only=True,
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'role', 'first_name', 'last_name')
        read_only_fields = ('id',)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def create(self, validated_data):
        role = validated_data.pop('role', UserProfile.Role.BUYER)
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            **validated_data,
        )
        user.profile.role = role
        user.profile.save(update_fields=['role'])
        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('No active account found with the given credentials.') from exc

        self.user = authenticate(
            request=self.context.get('request'),
            username=user.get_username(),
            password=password,
        )

        if (
            self.user is None
            or not self.user.is_active
            or getattr(self.user.profile, 'is_suspended', False)
            or getattr(self.user.profile, 'is_deleted', False)
        ):
            raise serializers.ValidationError('No active account found with the given credentials.')

        refresh = self.get_token(self.user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(self.user).data,
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = getattr(user.profile, 'role', UserProfile.Role.BUYER)
        return token
