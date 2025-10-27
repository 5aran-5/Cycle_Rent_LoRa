from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from .permissions import IsAdminUser, IsRegularUser
from rest_framework import generics

# Registration view
class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
# Custom token view (uses custom serializer)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# Role-based protected views
class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({"message": "Welcome Admin! You have full access."})


class UserOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def get(self, request):
        return Response({"message": "Hello User! You have limited access."})
