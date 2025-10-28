from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count
from datetime import timedelta
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    BicycleSerializer,
    ReservationSerializer,
    RentalLogSerializer,
    UserProfileSerializer,
    DashboardRecentRentalSerializer,  # added
)
from .models import Bicycle, Reservation, RentalLog, UserProfile
from .permissions import IsAdminUser, IsRegularUser
from rest_framework import status
from rest_framework.decorators import action


# -------------------------------
# Authentication & Role Views
# -------------------------------

class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
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
        # Automatically link logged-in user
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


# UserProfile management (admin-only)
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    
# -------------------------------
# Dashboard API
# -------------------------------
class DashboardView(APIView):
    """
    GET /api/dashboard/ -> returns:
    {
      "stats": { ... },
      "weeklyRentals": [ { "day": "Mon", "rentals": 12 }, ... ],
      "recentRentals": [ { "id": , "userName": , "deviceId": , "status": , "startTime": , "duration": "HH:MM:SS" } ]
    }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        now = timezone.now()

        # ---------- Stats ----------
        total_bikes = Bicycle.objects.count()
        available_bikes = Bicycle.objects.filter(status='available').count()
        ongoing_rentals = RentalLog.objects.filter(status__iexact='ongoing').count()
        offline_bikes = Bicycle.objects.filter(status='offline').count()
        # active users: number of active Django users (is_active=True)
        active_users = User.objects.filter(is_active=True).count()

        stats = {
            "totalBikes": total_bikes,
            "available": available_bikes,
            "ongoingRentals": ongoing_rentals,
            "offline": offline_bikes,
            "activeUsers": active_users,
        }

        # ---------- Weekly Rentals ----------
        # We will return last 7 days, labeled Mon..Sun with counts of rentals started on that day.
        # Create date array for the last 7 days (including today), but final output will be Mon..Sun order
        # To match sample ordering Mon..Sun, we'll compute counts per weekday name Mon..Sun.
        # Build a mapping weekday index (0=Mon..6=Sun) -> count
        start_date = (now - timedelta(days=6)).date()  # 6 days ago -> includes today
        end_date = now.date()

        # Initialize counts for each weekday (0=Mon .. 6=Sun)
        weekday_counts = {i: 0 for i in range(7)}

        rentals_last_7_days = RentalLog.objects.filter(start_time__date__gte=start_date, start_time__date__lte=end_date)
        # iterate and count by weekday of start_time
        for r in rentals_last_7_days:
            weekday_idx = r.start_time.weekday()  # Monday=0 .. Sunday=6
            weekday_counts[weekday_idx] += 1

        # Convert to array ordered Mon..Sun with day labels
        weekday_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_rentals = []
        for i in range(7):
            weekly_rentals.append({
                "day": weekday_labels[i],
                "rentals": weekday_counts.get(i, 0)
            })

        # ---------- Recent Rentals (last 4) ----------
        recent_qs = RentalLog.objects.select_related('user', 'bicycle').order_by('-start_time')[:4]
        recent_serialized = DashboardRecentRentalSerializer(recent_qs, many=True).data

        response = {
            "stats": stats,
            "weeklyRentals": weekly_rentals,
            "recentRentals": recent_serialized
        }

        return Response(response)
    
    
# -------------------------------
# Bicycle CRUD ViewSet (Admin-only)
# -------------------------------
class BicycleViewSet(viewsets.ModelViewSet):
    queryset = Bicycle.objects.all().order_by('device_id')
    serializer_class = BicycleSerializer

    def get_permissions(self):
        # Only admins can add/edit/delete; users can view list
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [perm() for perm in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def available(self, request):
        """Custom endpoint to fetch only available bicycles"""
        queryset = Bicycle.objects.filter(status='available')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)