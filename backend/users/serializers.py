from django.contrib.auth import authenticate, get_user_model
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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=UserProfile.Role.choices,
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

        if self.user is None or not self.user.is_active:
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
