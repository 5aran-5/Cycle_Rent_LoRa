# admin.py
from django.contrib import admin
from .models import UserProfile, Bicycle, Reservation, RentalLog

admin.site.register(UserProfile)
admin.site.register(Bicycle)
admin.site.register(Reservation)
admin.site.register(RentalLog)
