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
from rest_framework.exceptions import NotFound

from django.db import transaction
import os

# WEBHOOK INTEGRATION VIEW
# WEBHOOK_TOKEN = "enthutech_secret_12345"
WEBHOOK_TOKEN = os.environ.get("WEBHOOK_TOKEN", "Pj8cXx1aXH4aU4F0gE4g1SxGmLw6v0Yn_BYr7E8pP3A")

class EnthuTechWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1️⃣ Verify Token
        token = request.headers.get("Authorization")  # Expect: Bearer <token>
        if token != f"Bearer {WEBHOOK_TOKEN}":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        print("Received Webhook Data:", data)

        # 2️⃣ Extract required fields
        device_id = data.get("deviceID")
        payload = data.get("payload", {})

        if not device_id:
            return Response({"error": "Missing deviceID"}, status=status.HTTP_400_BAD_REQUEST)

        # 3️⃣ Extract latitude & longitude from payload
        latitude = payload.get("latitude")
        longitude = payload.get("longitude")

        if latitude is None or longitude is None:
            return Response({"error": "Payload must include 'latitude' and 'longitude'"},
                            status=status.HTTP_400_BAD_REQUEST)

        # 4️⃣ Update the matching bicycle
        try:
            bicycle = Bicycle.objects.get(device_id=device_id)
        except Bicycle.DoesNotExist:
            return Response({"error": f"No bicycle found with device_id {device_id}"},
                            status=status.HTTP_404_NOT_FOUND)

        bicycle.latitude = latitude
        bicycle.longitude = longitude
        bicycle.save()

        print(f"Updated {device_id}: lat={latitude}, lon={longitude}")

        # 5️⃣ Always return 200 OK for successful processing
        return Response(
            {"status": "success", "message": "Location updated"},
            status=status.HTTP_200_OK
        )


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

    def get_serializer(self, *args, **kwargs):
        # Allow partial updates (PATCH)
        if self.action in ['partial_update']:
            kwargs['partial'] = True
        return super().get_serializer(*args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Handle PATCH and PUT gracefully
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        username = instance.username
        self.perform_destroy(instance)
        return Response({"message": f"User '{username}' deleted successfully."}, status=status.HTTP_200_OK)


class AdminRentalLogView(APIView):
    """
    Admin-only view for managing rental logs:
    - GET: Fetch all rental logs
    - PATCH: Update rental status
    - DELETE: Delete a rental log
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """Fetch all rental logs"""
        rentals = RentalLog.objects.select_related('user', 'bicycle').order_by('-start_time')
        serializer = RentalLogSerializer(rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk=None):
        """Update rental status"""
        rental_id = request.data.get('id')
        new_status = request.data.get('status')

        if not rental_id or not new_status:
            return Response(
                {"error": "Both 'id' and 'status' fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rental = RentalLog.objects.get(id=rental_id)
        except RentalLog.DoesNotExist:
            raise NotFound("Rental log not found.")

        if new_status not in ['ongoing', 'completed']:
            return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

        rental.status = new_status
        if new_status == 'completed':
            rental.complete()
        else:
            rental.save()

        return Response(
            {"message": f"Rental {rental.id} updated successfully.", "status": rental.status},
            status=status.HTTP_200_OK
        )

    def delete(self, request):
        """Delete a rental log"""
        rental_id = request.data.get('id')
        if not rental_id:
            return Response({"error": "'id' field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rental = RentalLog.objects.get(id=rental_id)
        except RentalLog.DoesNotExist:
            raise NotFound("Rental log not found.")

        rental.delete()
        return Response({"message": f"Rental log {rental_id} deleted successfully."}, status=status.HTTP_200_OK)
    


# -------------------------------
# User Rental APIs (For Normal Users)
# -------------------------------
# -------------------------------
# User Rental APIs (For Normal Users)
# -------------------------------
from django.db import transaction

# -------------------------------
# User Rental APIs (For Normal Users)
# -------------------------------
class UserRentalAPIView(APIView):
    """
    Normal User:
    - GET    /api/user/bicycles/   → Fetch available bikes
    - POST   /api/user/rentals/    → Start or complete ride
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch only AVAILABLE bicycles"""
        bikes = Bicycle.objects.filter(status="available").order_by("device_id")
        serializer = BicycleSerializer(bikes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        """
        POST body should contain:
        {
            "action": "start" or "complete",
            "device_id": "<bike_id>",  # required for start
            "rental_id": "<id>"        # required for complete
        }

        Note: distance_km is NOT expected/handled in the request or response.
        """
        user = request.user
        action = request.data.get("action")

        if not action:
            return Response(
                {"error": "Missing 'action' field ('start' or 'complete' required)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------- START RIDE -------------
        if action == "start":
            device_id = request.data.get("device_id")
            if not device_id:
                return Response({"error": "'device_id' is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user already has an ongoing ride
            if RentalLog.objects.filter(user=user, status="ongoing").exists():
                return Response(
                    {"error": "You already have an ongoing ride."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Try to fetch available bike and lock it (prevent race conditions)
            try:
                bicycle = Bicycle.objects.select_for_update().get(device_id=device_id, status="available")
            except Bicycle.DoesNotExist:
                return Response(
                    {"error": f"Bicycle '{device_id}' not available or not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Create rental log entry (start_time auto-set by model's auto_now_add, but we set explicitly to be safe)
            rental = RentalLog.objects.create(
                user=user,
                bicycle=bicycle,
                start_time=timezone.now(),
                status="ongoing",
            )

            # Update bike status
            bicycle.status = "in_use"
            bicycle.save(update_fields=["status"])

            return Response(
                {
                    "message": f"Ride started successfully for bike {bicycle.device_id}.",
                    "rental_id": rental.id,
                    "bike_id": bicycle.device_id,
                    "user": user.username,
                    "status": rental.status,
                    "start_time": rental.start_time,
                },
                status=status.HTTP_201_CREATED,
            )

        # ------------- COMPLETE RIDE -------------
        elif action == "complete":
            rental_id = request.data.get("rental_id")
            if not rental_id:
                return Response(
                    {"error": "'rental_id' is required to complete the ride."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find ongoing rental and lock it
            try:
                rental = RentalLog.objects.select_for_update().select_related("bicycle").get(
                    id=rental_id, user=user, status="ongoing"
                )
            except RentalLog.DoesNotExist:
                return Response(
                    {"error": "No ongoing ride found with this rental_id."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Mark rental as completed and update timing (no distance_km)
            rental.complete()  # call without distance_km

            # Set bicycle available again
            bicycle = rental.bicycle
            bicycle.status = "available"
            bicycle.save(update_fields=["status"])

            # Ensure rental fields are saved (end_time, duration_minutes, status)
            rental.save(update_fields=["end_time", "duration_minutes", "status"])

            return Response(
                {
                    "message": f"Ride completed successfully for bike {bicycle.device_id}.",
                    "rental_id": rental.id,
                    "bike_id": bicycle.device_id,
                    "duration_minutes": rental.duration_minutes,
                    "end_time": rental.end_time,
                    "status": rental.status,
                },
                status=status.HTTP_200_OK,
            )

        # ------------- INVALID ACTION -------------
        else:
            return Response(
                {"error": "Invalid 'action'. Use 'start' or 'complete'."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# -------------------------------
# User Rental History API (For Normal Users)
# -------------------------------
class UserRentalHistoryAPIView(APIView):
    """
    Authenticated non-admin user can view their rental history (completed and ongoing)
    GET /api/user/rentals/history/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch all rental logs for this user (ordered by latest start_time)
        user_rentals = RentalLog.objects.filter(user=user).select_related("bicycle").order_by("-start_time")

        if not user_rentals.exists():
            return Response({"message": "No rental history found."}, status=status.HTTP_200_OK)

        serializer = RentalLogSerializer(user_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# User Profile (For Logged-in Normal User)
# -------------------------------
class UserProfileDetailAPIView(APIView):
    """
    GET /api/user/profile/
    Fetches the logged-in user's profile details (name & RFID tag)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        data = {
            "username": user.username,
            "rfid_tag": profile.rfid_tag,
            "registered_date": profile.registered_date
        }
        return Response(data, status=status.HTTP_200_OK)
