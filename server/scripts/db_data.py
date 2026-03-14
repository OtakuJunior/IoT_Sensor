import random
import requests
from datetime import datetime, timedelta
from app.config import settings
import sys

API_URL = "http://127.0.0.1:8000"

LOCATIONS = [
  "Lab 1",
  "Lab 2"
]

ASSETS_CONFIG = [
    {
        "name": "IAQ Monitor Lab 1",
        "status": "Operational",
        "last_maintenance": (datetime.now() - timedelta(days=5)).isoformat(),
        "location_ref": "Lab 1"
    },
    {
        "name": "IAQ Monitor Lab 2",
        "status": "Operational",
        "last_maintenance": (datetime.now() - timedelta(days=5)).isoformat(),
        "location_ref": "Lab 2"
    }
]

SENSORS_CONFIG = [
    {
        "name": "Temperature Sensor",
        "sensor_type": "Temperature",
        "unit": "°C",
        "asset_ref": "IAQ Monitor Lab 1",
        "location_ref": "Lab 1",
        "min_critical": 15.0,
        "min_warning": 18.0,
        "max_warning": 26.0,
        "max_critical": 30.0,
        "status": "Active"
    },
    {
        "name": "Humidity Sensor",
        "sensor_type": "Humidity",
        "unit": "%",
        "asset_ref": "IAQ Monitor Lab 1",
        "location_ref": "Lab 1",
        "min_critical": 20.0,
        "min_warning": 30.0,
        "max_warning": 60.0,
        "max_critical": 70.0,
        "status": "Active"
    },
    {
        "name": "CO2 Level",
        "sensor_type": "Gaz",
        "unit": "ppm",
        "asset_ref": "IAQ Monitor Lab 1",
        "location_ref": "Lab 1",
        "min_critical": 0.0,
        "min_warning": 0.0,
        "max_warning": 1000.0,
        "max_critical": 1500.0,
        "status": "Active"
    },
    {
        "name": "Lab Pressure",
        "sensor_type": "Pressure",
        "unit": "hPa",
        "asset_ref": None,
        "location_ref": "Lab 1",
        "min_critical": 950.0,
        "min_warning": 980.0,
        "max_warning": 1040.0,
        "max_critical": 1050.0,
        "status": "Active"
    },
    {
        "name": "Temperature Sensor",
        "sensor_type": "Temperature",
        "unit": "°C",
        "asset_ref": "IAQ Monitor Lab 2",
        "location_ref": "Lab 2",
        "min_critical": 15.0,
        "min_warning": 18.0,
        "max_warning": 26.0,
        "max_critical": 30.0,
        "status": "Active"
    },
    {
        "name": "Humidity Sensor",
        "sensor_type": "Humidity",
        "unit": "%",
        "asset_ref": "IAQ Monitor Lab 2",
        "location_ref": "Lab 2",
        "min_critical": 20.0,
        "min_warning": 30.0,
        "max_warning": 60.0,
        "max_critical": 70.0,
        "status": "Active"
    },
    {
        "name": "CO2 Level",
        "sensor_type": "Gaz",
        "unit": "ppm",
        "asset_ref": "IAQ Monitor Lab 2",
        "location_ref": "Lab 2",
        "min_critical": 0.0,
        "min_warning": 0.0,
        "max_warning": 1000.0,
        "max_critical": 1500.0,
        "status": "Active"
    },
    {
        "name": "Fire Alarm",
        "sensor_type": "Smoke",
        "unit": "ppm",
        "asset_ref": None,
        "location_ref": "Lab 1",
        "min_critical": 0.0,
        "min_warning": 0.0,
        "max_warning": 30.0,
        "max_critical": 50.0,
        "status": "Active"
    },
]

def get_token():
    try:
        res = requests.post(
            f"{settings.KEYCLOAK_SERVER_URL}realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": settings.KEYCLOAK_CLIENT_ID,
                "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
                "username": settings.SEED_USERNAME,
                "password": settings.SEED_PASSWORD
            },
            timeout=10
        )
        res.raise_for_status()
        return res.json()["access_token"]
    except Exception as e:
        print(f"Erreur d'authentification Keycloak : {e}")
        sys.exit(1)

def run_seed():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    location_map = {}
    for loc_name in LOCATIONS:
        try:
            res = requests.post(f"{API_URL}/locations", json={"name": loc_name}, headers=headers)
            print(f"Status: {res.status_code}, Response: {res.json()}")
            location_map[loc_name] = res.json()["id"]
            if res.status_code == 401:
                location_map[loc_name] = res.json()["id"]
        except requests.exceptions.ConnectionError:
            exit()
    asset_map = {}
    for asset in ASSETS_CONFIG:

        loc_id = location_map.get(asset["location_ref"])
        print(loc_id)
        if loc_id:
            payload = {
                "name": asset["name"],
                "status": asset["status"],
                "last_maintenance": asset["last_maintenance"],
                "location_id": loc_id
            }
            res = requests.post(f"{API_URL}/assets", json=payload, headers=headers)
            print("Reached here ?")

            print(res.status_code, res.json())

            if res.status_code == 201:
                asset_map[asset["name"]] = res.json()["id"]

    sensor_ids = []
    for sensor in SENSORS_CONFIG:
        payload = {
            "name": sensor["name"],
            "sensor_type": sensor["sensor_type"],
            "unit": sensor["unit"],
            "min_warning": sensor["min_warning"],
            "max_warning": sensor["max_warning"],
            "min_critical": sensor["min_critical"],
            "max_critical": sensor["max_critical"],
            "status": sensor["status"],
            "asset_id": None,
            "location_id": None
        }

        valid_config = False

        if sensor.get("asset_ref"):
            asset_uuid = asset_map.get(sensor["asset_ref"])
            if asset_uuid:
                payload["asset_id"] = asset_uuid
                valid_config = True

        if sensor.get("location_ref"):
            loc_uuid = location_map.get(sensor["location_ref"])
            if loc_uuid:
                payload["location_id"] = loc_uuid
                valid_config = True
        if valid_config:
            res = requests.post(f"{API_URL}/sensors", json=payload, headers=headers)
            print("IVEOIFJOIEJFEOI", res.json())
            if res.status_code == 201:
                sensor_ids.append(res.json()["id"])
                sensor["id"] = res.json()["id"]

    start_time = datetime.now() - timedelta(days=1)
    hours_duration = 5
    data_per_hours = 60
    total_data = hours_duration * data_per_hours

    for i in range(total_data):
        current_time = start_time + timedelta(minutes=i)
        for sensor in SENSORS_CONFIG:
            val = random.uniform(sensor["min_warning"], sensor["max_warning"])
            if random.random() < 0.05:
                val = random.uniform(sensor["max_warning"], sensor["max_critical"])
            if random.random() < 0.02:
                val = random.uniform(sensor["max_critical"], sensor["max_critical"] + 5)
            payload = {
                "sensor_id": sensor["id"],
                "value": round(val, 2),
                "time": current_time.isoformat()
            }
            requests.post(f"{API_URL}/sensor_data", json=payload, headers=headers)

if __name__ == "__main__":
    run_seed()