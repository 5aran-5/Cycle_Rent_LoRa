from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Bicycle, UserProfile, Reservation, RentalLog
from datetime import timedelta
from django.utils import timezone

# 1️⃣ User registration
class UserRegistrationSerializer(serializers.ModelSerializer):
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
    user = serializers.SerializerMethodField()
    bicycle = BicycleSerializer(read_only=True)

    class Meta:
        model = RentalLog
        fields = [
            'id', 'user', 'bicycle', 'start_time', 'end_time',
            'duration_minutes', 'distance_km', 'status'
        ]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email
        }


# 6️⃣ User Profile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    rfid_tag = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    registered_date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['rfid_tag', 'registered_date']



# 7️⃣ User serializer (Admin CRUD)
class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        rfid_tag = profile_data.get('rfid_tag', None)
        UserProfile.objects.update_or_create(user=user, defaults={'rfid_tag': rfid_tag})
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        instance.username = validated_data.get('username', instance.username)
        if password:
            instance.set_password(password)
        instance.save()

        profile = instance.userprofile
        if profile_data:
            rfid_tag = profile_data.get('rfid_tag', profile.rfid_tag)
            profile.rfid_tag = rfid_tag
            profile.save()

        return instance




# 8️⃣ Dashboard Recent Rental Serializer
class DashboardRecentRentalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    userName = serializers.CharField(source='user.username')
    deviceId = serializers.CharField(source='bicycle.device_id')
    status = serializers.CharField()
    startTime = serializers.DateTimeField(source='start_time')
    duration = serializers.SerializerMethodField()

    def get_duration(self, obj):
        if getattr(obj, 'duration_minutes', None):
            mins = float(obj.duration_minutes)
            seconds = int(mins * 60)
        else:
            end = obj.end_time if getattr(obj, 'end_time', None) else timezone.now()
            delta = end - obj.start_time
            seconds = int(delta.total_seconds())

        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
