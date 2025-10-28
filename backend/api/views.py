from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    BicycleSerializer,
    ReservationSerializer,
    RentalLogSerializer,
    UserProfileSerializer
)
from .models import Bicycle, Reservation, RentalLog, UserProfile
from .permissions import IsAdminUser, IsRegularUser


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