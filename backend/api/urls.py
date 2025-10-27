from django.urls import path
from .views import AdminOnlyView, UserOnlyView

urlpatterns = [
    path("admin-only/", AdminOnlyView.as_view(), name="admin-only"),
    path("user-only/", UserOnlyView.as_view(), name="user-only"),
]
