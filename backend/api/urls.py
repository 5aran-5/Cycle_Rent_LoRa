from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminOnlyView, UserOnlyView,
    BicycleListView, ReservationCreateView, ReservationListView, RentalListView,
    UserProfileViewSet
)

router = DefaultRouter()
router.register(r'user-profiles', UserProfileViewSet, basename='user-profile')

urlpatterns = [
    # Role-based
    path("admin-only/", AdminOnlyView.as_view(), name="admin-only"),
    path("user-only/", UserOnlyView.as_view(), name="user-only"),

    # Core app
    path("bicycles/", BicycleListView.as_view(), name="bicycle-list"),
    path("reservations/", ReservationCreateView.as_view(), name="reservation-create"),
    path("reservations/mine/", ReservationListView.as_view(), name="reservation-list"),
    path("rentals/", RentalListView.as_view(), name="rental-list"),

    # Admin profile management (CRUD)
    path("", include(router.urls)),
]
