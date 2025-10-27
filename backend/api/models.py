from django.db import models
from django.contrib.auth.models import User

# 1️⃣ Bicycle model
class Bicycle(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('offline', 'Offline'),
    ]

    device_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    last_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bike {self.device_id} ({self.status})"


# 2️⃣ User Profile (to store RFID, etc.)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rfid_tag = models.CharField(max_length=50, unique=True)
    registered_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


# 3️⃣ Rental Log
class RentalLog(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bicycle = models.ForeignKey(Bicycle, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.FloatField(null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ongoing')

    def __str__(self):
        return f"{self.user.username} - {self.bicycle.device_id} ({self.status})"
from django.db import models
from django.contrib.auth.models import User

# 1️⃣ Bicycle model
class Bicycle(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('offline', 'Offline'),
    ]

    device_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    last_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bike {self.device_id} ({self.status})"


# 2️⃣ User Profile (to store RFID, etc.)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rfid_tag = models.CharField(max_length=50, unique=True)
    registered_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


# 3️⃣ Rental Log
class RentalLog(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bicycle = models.ForeignKey(Bicycle, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.FloatField(null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ongoing')

    def __str__(self):
        return f"{self.user.username} - {self.bicycle.device_id} ({self.status})"
