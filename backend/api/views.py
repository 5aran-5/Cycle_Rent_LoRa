from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    BicycleSerializer,
    ReservationSerializer,
    RentalLogSerializer,
    UserProfileSerializer,
    DashboardRecentRentalSerializer,
)
from .models import Bicycle, Reservation, RentalLog, UserProfile
from .permissions import IsAdminUser, IsRegularUser
from django.conf import settings

import os

# WEBHOOK INTEGRATION VIEW
# WEBHOOK_TOKEN = "enthutech_secret_12345"
WEBHOOK_TOKEN = os.environ.get("WEBHOOK_TOKEN", "enthutech_secret_12345")

class EnthuTechWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.headers.get("Authorization")  # Expect: Bearer <token>
        if token != f"Bearer {WEBHOOK_TOKEN}":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        print("Received Webhook Data:", data)  # Log or inspect data temporarily

        # For now, just acknowledge
        return Response({"status": "success", "message": "Data received"}, status=status.HTTP_200_OK)

# -------------------------------
# Authentication & Role Views
# -------------------------------

class UserCreateView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({"message": "Welcome Admin! You have full access."})


class UserOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def get(self, request):
        return Response({"message": "Hello User! You have limited access."})


# -------------------------------
# Bicycle, Reservation, Rental APIs
# -------------------------------

class BicycleListView(generics.ListAPIView):
    queryset = Bicycle.objects.all().order_by('device_id')
    serializer_class = BicycleSerializer
    permission_classes = [IsAuthenticated]


class ReservationCreateView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


class ReservationListView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).order_by('-reserved_at')


class RentalListView(generics.ListAPIView):
    queryset = RentalLog.objects.all().order_by('-start_time')
    serializer_class = RentalLogSerializer
    permission_classes = [IsAuthenticated]


# -------------------------------
# UserProfile management (Admin-only)
# -------------------------------
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.select_related('user').all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


# -------------------------------
# Dashboard API
# -------------------------------
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        now = timezone.now()
        total_bikes = Bicycle.objects.count()
        available_bikes = Bicycle.objects.filter(status='available').count()
        ongoing_rentals = RentalLog.objects.filter(status__iexact='ongoing').count()
        offline_bikes = Bicycle.objects.filter(status='offline').count()
        active_users = User.objects.filter(is_active=True, is_staff=False).count()

        stats = {
            "totalBikes": total_bikes,
            "available": available_bikes,
            "ongoingRentals": ongoing_rentals,
            "offline": offline_bikes,
            "activeUsers": active_users,
        }

        start_date = (now - timedelta(days=6)).date()
        end_date = now.date()
        weekday_counts = {i: 0 for i in range(7)}
        rentals_last_7_days = RentalLog.objects.filter(start_time__date__gte=start_date, start_time__date__lte=end_date)

        for r in rentals_last_7_days:
            weekday_idx = r.start_time.weekday()
            weekday_counts[weekday_idx] += 1

        weekday_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_rentals = [{"day": weekday_labels[i], "rentals": weekday_counts.get(i, 0)} for i in range(7)]

        recent_qs = RentalLog.objects.select_related('user', 'bicycle').order_by('-start_time')[:4]
        recent_serialized = DashboardRecentRentalSerializer(recent_qs, many=True).data

        return Response({
            "stats": stats,
            "weeklyRentals": weekly_rentals,
            "recentRentals": recent_serialized
        })


# -------------------------------
# Bicycle CRUD ViewSet (Admin-only)
# -------------------------------
class BicycleViewSet(viewsets.ModelViewSet):
    queryset = Bicycle.objects.all().order_by('device_id')
    serializer_class = BicycleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [perm() for perm in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def available(self, request):
        queryset = Bicycle.objects.filter(status='available')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# -------------------------------
# User CRUD (Admin-only, no staff)
# -------------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_staff=False).select_related('userprofile').order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        username = instance.username
        self.perform_destroy(instance)
        return Response({"message": f"User '{username}' deleted successfully."}, status=status.HTTP_200_OK)
