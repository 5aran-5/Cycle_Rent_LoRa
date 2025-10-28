from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminOnlyView, UserOnlyView,
    BicycleListView, ReservationCreateView, ReservationListView, RentalListView,
    UserProfileViewSet, DashboardView,
    BicycleViewSet  # <-- add this
)


router = DefaultRouter()
router.register(r'user-profiles', UserProfileViewSet, basename='user-profile')
router.register(r'bicycles', BicycleViewSet, basename='bicycle')

urlpatterns = [
    path("admin-only/", AdminOnlyView.as_view(), name="admin-only"),
    path("user-only/", UserOnlyView.as_view(), name="user-only"),

    # Reservation & Rental
    path("reservations/", ReservationCreateView.as_view(), name="reservation-create"),
    path("reservations/mine/", ReservationListView.as_view(), name="reservation-list"),
    path("rentals/", RentalListView.as_view(), name="rental-list"),

    # Dashboard
    path("dashboard/", DashboardView.as_view(), name="dashboard"),

    # Include routers (bicycles + user-profiles)
    path("", include(router.urls)),
]
