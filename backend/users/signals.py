from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UserProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        role = UserProfile.Role.ADMIN if instance.is_staff or instance.is_superuser else UserProfile.Role.BUYER
        UserProfile.objects.create(user=instance, role=role)
