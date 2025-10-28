from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from api.models import Bicycle, UserProfile, RentalLog  # ✅ changed from 'core' to 'api'

class Command(BaseCommand):
    help = "Seed initial dummy data for testing"

    def handle(self, *args, **options):
        # --- USERS ---
        users_data = [
            {"username": "saran", "email": "saran@vit.edu", "password": "test1234", "rfid_tag": "RFID001"},
            {"username": "arjun", "email": "arjun@vit.edu", "password": "test1234", "rfid_tag": "RFID002"},
            {"username": "deepa", "email": "deepa@vit.edu", "password": "test1234", "rfid_tag": "RFID003"},
            {"username": "kavya", "email": "kavya@vit.edu", "password": "test1234", "rfid_tag": "RFID004"},
            {"username": "raj", "email": "raj@vit.edu", "password": "test1234", "rfid_tag": "RFID005"},
        ]

        for data in users_data:
            user, created = User.objects.get_or_create(username=data["username"], defaults={
                "email": data["email"]
            })
            if created:
                user.set_password(data["password"])
                user.save()
                user.userprofile.rfid_tag = data["rfid_tag"]
                user.userprofile.save()
                self.stdout.write(self.style.SUCCESS(f"Created user {user.username}"))
            else:
                self.stdout.write(self.style.WARNING(f"User {user.username} already exists"))

        # --- BICYCLES ---
        bikes_data = [
            ("BIKE001", "available", 12.8418, 80.1532),
            ("BIKE002", "reserved",  12.8426, 80.1554),
            ("BIKE003", "available", 12.8440, 80.1571),
            ("BIKE004", "in_use",    12.8452, 80.1590),
            ("BIKE005", "offline",   12.8461, 80.1603),
            ("BIKE006", "available", 12.8474, 80.1620),
        ]

        for device_id, status, lat, lon in bikes_data:
            bike, created = Bicycle.objects.get_or_create(
                device_id=device_id,
                defaults={"status": status, "latitude": lat, "longitude": lon}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created {bike}"))
            else:
                self.stdout.write(self.style.WARNING(f"{bike.device_id} already exists"))

        # --- RENTAL LOGS ---
        self.stdout.write("📦 Creating sample rental logs...")

        users = list(User.objects.all())
        bikes = list(Bicycle.objects.all())

        sample_rentals = [
            # ongoing ride
            {
                "user": users[0],
                "bicycle": bikes[3],  # in_use
                "start_time": timezone.now() - timedelta(minutes=12),
                "status": "ongoing"
            },
            # completed rides
            {
                "user": users[1],
                "bicycle": bikes[1],
                "start_time": timezone.now() - timedelta(hours=1, minutes=30),
                "end_time": timezone.now() - timedelta(hours=1),
                "distance_km": 2.4,
                "status": "completed"
            },
            {
                "user": users[2],
                "bicycle": bikes[2],
                "start_time": timezone.now() - timedelta(hours=3, minutes=45),
                "end_time": timezone.now() - timedelta(hours=3, minutes=20),
                "distance_km": 4.7,
                "status": "completed"
            },
        ]

        for data in sample_rentals:
            rental, created = RentalLog.objects.get_or_create(
                user=data["user"],
                bicycle=data["bicycle"],
                start_time=data["start_time"],
                defaults={
                    "end_time": data.get("end_time"),
                    "status": data["status"],
                    "distance_km": data.get("distance_km"),
                }
            )

            # Calculate duration if completed
            if data["status"] == "completed" and data.get("end_time"):
                delta = data["end_time"] - data["start_time"]
                rental.duration_minutes = delta.total_seconds() / 60.0
                rental.save()

            self.stdout.write(self.style.SUCCESS(f"Added rental for {rental.user.username} - {rental.status}"))

        self.stdout.write(self.style.SUCCESS("✅ Dummy data seeding complete!"))
