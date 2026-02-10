import random
import requests
from datetime import datetime, timedelta

API_URL = "http://127.0.0.1:8000"

LOCATIONS = [
  "Lab 1",
  "Lab 2", 
  "Lab 3"
]

ASSETS_CONFIG = [
    {
        "name": "3D Printer Prusa",
        "status": "Operational",
        "last_maintenance": (datetime.now() - timedelta(days=5)).isoformat(),
        "location_ref": "Lab 1"
    },
    {
        "name": "Soldering Station A",
        "status": "Operational",
        "last_maintenance": (datetime.now() - timedelta(days=60)).isoformat(),
        "location_ref": "Lab 1"
    },
    
    {
        "name": "Incubator BIO-200",
        "status": "Operational",
        "last_maintenance": (datetime.now() - timedelta(days=2)).isoformat(),
        "location_ref": "Lab 2"
    },
    {
        "name": "Centrifuge C500",
        "status": "Maintenance", 
        "last_maintenance": (datetime.now() - timedelta(days=120)).isoformat(),
        "location_ref": "Lab 2"
    },

    {
        "name": "Electron Microscope",
        "status": "Operational",
        "last_maintenance": None, 
        "location_ref": "Lab 3"
    }
]


SENSORS_CONFIG = [
    {
        "name": "Nozzle Temp",
        "sensor_type": 'Temperature',
        "unit": "°C",          
        "asset_ref": "3D Printer Prusa",
        "location_ref": None,
        "min": 10, "max": 40
    },
    {
        "name": "Incubator Temp",
        "sensor_type": 'Temperature',
        "unit": "°C",
        "asset_ref": "Incubator BIO-200",
        "location_ref": None,
        "min": 35, "max": 39
    },
    {
        "name": "CO2 Level",
        "sensor_type": "Gaz",
        "unit": "ppm", 
        "asset_ref": "Incubator BIO-200",
        "location_ref": None,
        "min": 4.5, "max": 5.5
    },
    
    {
        "name": "Lab Pressure",
        "sensor_type": "Pressure",
        "unit": "hPa",       
        "asset_ref": None,
        "location_ref": "Lab 3",
        "min": 1000, "max": 1020
    },
    {
        "name": "Fire Alarm",
        "sensor_type": 'Smoke',
        "unit": "ppm",        
        "asset_ref": None,
        "location_ref": "Lab 2",
        "min": 0, "max": 1
    },
]

def run_seed():
    location_map = {} 

    for zone_name in LOCATIONS:
        try:
            res = requests.post(f"{API_URL}/locations", json={"name": zone_name})
            if res.status_code == 201:
                location_map[zone_name] = res.json()["id"]
        except requests.exceptions.ConnectionError:
            exit()

    asset_map = {} 

    for asset in ASSETS_CONFIG:
        loc_id = location_map.get(asset["location_ref"])

        if loc_id:
            payload = {
                "name": asset["name"],
                "status": asset["status"],
                "last_maintenance": asset["last_maintenance"],
                "location_id": loc_id
            }
            res = requests.post(f"{API_URL}/assets", json=payload)
            
            if res.status_code == 201:
                asset_map[asset["name"]] = res.json()["id"]

    sensor_ids = []

    for sensor in SENSORS_CONFIG:
        payload = {
            "name": sensor["name"],
            "sensor_type": sensor["sensor_type"],
            "unit": sensor["unit"],
            "min_critical": sensor["min"],
            "max_critical": sensor["max"],
            "status": "Active"
        }

        valid_config = False

        if sensor["asset_ref"]:
            asset_uuid = asset_map.get(sensor["asset_ref"])
            if asset_uuid:
                payload["asset_id"] = asset_uuid
                payload["location_id"] = None
                valid_config = True
        
        elif sensor["location_ref"]:
            loc_uuid = location_map.get(sensor["location_ref"])
            if loc_uuid:
                payload["location_id"] = loc_uuid
                payload["asset_id"] = None
                valid_config = True
        
        if valid_config:
            res = requests.post(f"{API_URL}/sensors", json=payload)
            if res.status_code == 201:
                sensor_ids.append(res.json()["id"])

    start_time = datetime.now() - timedelta(days=1)
    hours_duration = 5
    data_per_hours = 60
    total_data = hours_duration * data_per_hours
    for i in range(total_data):
        current_time = start_time + timedelta(minutes=i)
        
        for s_id in sensor_ids:
            val = 20.0 + random.uniform(-5, 5)
            
            if random.random() < 0.05:
                val = 50.0 + random.uniform(0, 25)

            payload = {
                "sensor_id": s_id,
                "value": round(val, 2),
                "time": current_time.isoformat()
            }
            requests.post(f"{API_URL}/sensor_data", json=payload)

if __name__ == "__main__":
    run_seed()