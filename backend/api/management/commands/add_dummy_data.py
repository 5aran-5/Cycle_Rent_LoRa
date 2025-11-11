from django.contrib.auth.models import User
from app_name.models import Bicycle, RentalLog  # ⬅️ Replace 'app_name' with your Django app name
from django.utils import timezone
import random

# --- User Data ---
user_data = [
    {"username": "john_doe", "email": "john@example.com", "rfid": "RFID-JOHN-001"},
    {"username": "alan_smith", "email": "alan@example.com", "rfid": "RFID-ALAN-002"},
    {"username": "emma_watson", "email": "emma@example.com", "rfid": "RFID-EMMA-003"},
    {"username": "sophia_jones", "email": "sophia@example.com", "rfid": "RFID-SOPHIA-004"},
    {"username": "michael_clark", "email": "michael@example.com", "rfid": "RFID-MICHAEL-005"},
]

admin_data = [
    {"username": "admin_1", "email": "admin1@example.com", "rfid": "ADMIN-RFID-101"},
    {"username": "admin_2", "email": "admin2@example.com", "rfid": "ADMIN-RFID-102"},
]

bike_statuses = ['available', 'in_use', 'offline', 'available', 'in_use', 'available', 'offline']

# VIT Chennai Campus location center
CENTER_LAT = 12.8400
CENTER_LON = 80.1530

# --- Create Users ---
def create_users():
    print("👤 Creating users...")

    # Admins
    for data in admin_data:
        user, created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data["email"],
                "is_superuser": True,
                "is_staff": True,
            },
        )
        if created:
            user.set_password("adminpass")
            user.save()
            user.userprofile.rfid_tag = data["rfid"]
            user.userprofile.save()
            print(f"✅ Created admin: {data['username']}")
        else:
            print(f"⚠️ Admin already exists: {data['username']}")

    # Regular Users
    for data in user_data:
        user, created = User.objects.get_or_create(
            username=data["username"],
            defaults={"email": data["email"]}
        )
        if created:
            user.set_password("userpass")
            user.save()
            user.userprofile.rfid_tag = data["rfid"]
            user.userprofile.save()
            print(f"✅ Created user: {data['username']}")
        else:
            print(f"⚠️ User already exists: {data['username']}")


# --- Create Bicycles ---
def create_bicycles():
    print("\n🚲 Creating bicycles...")

    for i in range(1, 8):
        device_id = f"BIKE{i:03}"
        if not Bicycle.objects.filter(device_id=device_id).exists():
            # Random small offset within campus area (~200m radius)
            lat = CENTER_LAT + random.uniform(-0.0015, 0.0015)
            lon = CENTER_LON + random.uniform(-0.0015, 0.0015)

            Bicycle.objects.create(
                device_id=device_id,
                status=bike_statuses[i - 1],
                latitude=lat,
                longitude=lon
            )
            print(f"✅ Created {device_id} ({bike_statuses[i-1]}) at ({lat:.6f}, {lon:.6f})")
        else:
            print(f"⚠️ {device_id} already exists.")


# --- Create Rental Logs ---
def create_rental_logs():
    print("\n📜 Creating rental logs...")

    users = User.objects.filter(is_superuser=False)
    bicycles = list(Bicycle.objects.all())

    for i in range(1, 8):
        user = random.choice(users)
        bicycle = random.choice(bicycles)

        # Avoid duplicate user-bike log
        if RentalLog.objects.filter(user=user, bicycle=bicycle).exists():
            continue

        start_time = timezone.now() - timezone.timedelta(hours=random.randint(1, 10))
        end_time = start_time + timezone.timedelta(minutes=random.randint(10, 60))

        RentalLog.objects.create(
            user=user,
            bicycle=bicycle,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=(end_time - start_time).total_seconds() / 60,
            distance_km=round(random.uniform(0.5, 4.5), 2),
            status=random.choice(['completed', 'ongoing'])
        )
        print(f"✅ Log added: {user.username} → {bicycle.device_id}")

    print("✅ Rental logs created successfully.")


# --- Run All ---
if __name__ == "__main__":
    create_users()
    create_bicycles()
    create_rental_logs()
    print("\n🎉 Dummy data successfully added! 🚴‍♂️")
