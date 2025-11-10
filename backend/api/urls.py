from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminOnlyView, UserOnlyView,
    BicycleListView, ReservationCreateView, ReservationListView, RentalListView,
    UserProfileViewSet, DashboardView,
    BicycleViewSet, UserViewSet, EnthuTechWebhookView
)

router = DefaultRouter()
router.register(r'user-profiles', UserProfileViewSet, basename='user-profile')
router.register(r'bicycles', BicycleViewSet, basename='bicycle')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path("admin-only/", AdminOnlyView.as_view(), name="admin-only"),
    path("user-only/", UserOnlyView.as_view(), name="user-only"),
    
    path("reservations/", ReservationCreateView.as_view(), name="reservation-create"),
    path("reservations/mine/", ReservationListView.as_view(), name="reservation-list"),
    
    path("rentals/", RentalListView.as_view(), name="rental-list"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    
    path("webhook/enthutech/", EnthuTechWebhookView.as_view(), name="enthutech-webhook"),
    
    path("", include(router.urls)),
]
