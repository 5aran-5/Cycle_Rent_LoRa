import requests
import json

# URL of your webhook endpoint
url = "http://127.0.0.1:8000/api/webhook/enthutech/"

# Headers (include your Bearer token)
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer enthutech_secret_12345"
}

# Payload (data to send)
payload = {
    "device_id": "bike101",
    "latitude": 12.9716,
    "longitude": 77.5946
}

# Send POST request
response = requests.post(url, headers=headers, data=json.dumps(payload))

# Print response details
print("Status Code:", response.status_code)
try:
    print("Response JSON:", response.json())
except ValueError:
    print("Response Text:", response.text)
