import os
import sys
import django

sys.path.append('C:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.serializers import RegisterSerializer

data = {
    'email': 'test500@example.com',
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'User',
    'role': 'buyer'
}

serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    try:
        user = serializer.save()
        print("Success!", user)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("Invalid:", serializer.errors)
