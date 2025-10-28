from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Bicycle, UserProfile, Reservation, RentalLog

# 1️⃣ User registration
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# 2️⃣ Custom token serializer (adds role info)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token


# 3️⃣ Bicycle serializer
class BicycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bicycle
        fields = ['id', 'device_id', 'status', 'latitude', 'longitude', 'last_update']


# 4️⃣ Reservation serializer
class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    bicycle = serializers.SlugRelatedField(slug_field='device_id', queryset=Bicycle.objects.all())

    class Meta:
        model = Reservation
        fields = ['id', 'user', 'bicycle', 'reserved_at', 'expiry_at', 'status']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


# 5️⃣ Rental Log serializer
class RentalLogSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    bicycle = BicycleSerializer(read_only=True)

    class Meta:
        model = RentalLog
        fields = ['id', 'user', 'bicycle', 'start_time', 'end_time', 'duration_minutes', 'distance_km', 'status']


# 6️⃣ User Profile serializer (for admin management of RFID)
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'rfid_tag', 'registered_date']