import time 
import random
import requests
from datetime import datetime, timezone
import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion
import json
import os

API_URL = os.getenv("API_URL", "http://localhost/api")
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
DATA_DELAY = 1
GET_SENSOR_DELAY = 30


def get_sensors():
    for _ in range(10):
        try:
            response = requests.get(f"{API_URL}/sensors", timeout=5)
            print(f"Status: {response.status_code}, Response: {response.text[:200]}")  # ← ajoute
            if response.status_code == 200:
                data = response.json()
                return data if isinstance(data, list) else []
        except Exception as e:
            print(f"Waiting for server... {e}")
            time.sleep(5)
    return []

def on_connect(client, userdata, flags, reason_code, properties = None):
  if reason_code == 0:
    print(f"Connected with result code {reason_code}")

def generate_data():
  last_update = 0

  sensors = get_sensors()
    
  if not sensors:
      print("No sensors found in database. Please add sensors via the API first.")
        # On attend un peu avant de quitter pour ne pas spammer les restarts
      time.sleep(10) 
      return 
    
  print(f"Found {len(sensors)} sensors. Starting MQTT loop...")

  
  # MQTT setup
  client = mqtt.Client(CallbackAPIVersion.VERSION2)  
  client.on_connect = on_connect  
  try:
    client.connect(MQTT_BROKER, 1883)
    client.loop_start()
  except Exception as e:
    print(f"{e}")
    return
  try:
    while True:
      current_time = time.time()
      if current_time - last_update > GET_SENSOR_DELAY:
          sensors = get_sensors()
          last_update = current_time
          
      for s in sensors:
        if (s['status'] == "Active"):
          val = random.uniform(s["min_warning"], s["max_warning"])
          if random.random() < 0.01:
            val = random.uniform(s['max_warning'], s["max_critical"])
          if random.random() < 0.02:
            val = random.uniform(s['max_critical'],s['max_critical']+5)

          payload = {
            "sensor_id": s["id"],
            "value": round(val, 2),
            "time": datetime.now(timezone.utc).isoformat() 
          }

          topic = f"factory/sensors/{s['id']}/data"
          client.publish(topic, json.dumps(payload), qos=1)
          print("data generated at ", datetime.now(timezone.utc).isoformat())
      time.sleep(DATA_DELAY)
  except KeyboardInterrupt:
    print("\ndata generation interrupted")
  finally:
    client.loop_stop()
    client.disconnect()
      

if __name__ == "__main__":
  generate_data()