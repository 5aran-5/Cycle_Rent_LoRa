from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1️⃣ Bicycle model
class Bicycle(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
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


# 2️⃣ User Profile (stores RFID tag)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rfid_tag = models.CharField(max_length=100, blank=True, null=True)
    registered_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


# 🔄 Auto-create UserProfile when new User is created
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        instance.userprofile.save()


# 3️⃣ Reservation (booking before tapping RFID)
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bicycle = models.ForeignKey(Bicycle, on_delete=models.CASCADE)
    reserved_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # expiry_at = models.DateTimeField(default=lambda: timezone.now() + timedelta(minutes=10))
    def default_expiry():
        return timezone.now() + timedelta(minutes=10)

    expiry_at = models.DateTimeField(default=default_expiry)

    def save(self, *args, **kwargs):
        # If expiry_at not provided, default to 10 minutes from reserved_at
        if not self.expiry_at:
            self.expiry_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def is_active(self):
        return self.status == 'pending' and timezone.now() <= self.expiry_at

    def __str__(self):
        return f"{self.user.username} -> {self.bicycle.device_id} ({self.status})"


# 4️⃣ Rental Log (after unlock confirmed)
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

    def complete(self, end_time=None, distance_km=None):
        if not end_time:
            end_time = timezone.now()
        self.end_time = end_time
        delta = end_time - self.start_time
        self.duration_minutes = delta.total_seconds() / 60.0
        if distance_km is not None:
            self.distance_km = distance_km
        self.status = 'completed'
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.bicycle.device_id} ({self.status})"
