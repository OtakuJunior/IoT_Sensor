import time 
import random
import requests
from datetime import datetime, timezone
import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion
import json

API_URL = "http://127.0.0.1:8000"
DELAY = 1

def get_sensors():
  response = requests.get(f"{API_URL}/sensors")
  if response.status_code == 200:
    return response.json()
  return []

def on_connect(client, userdata, flags, reason_code, properties = None):
  if reason_code == 0:
    print(f"Connected with result code {reason_code}")

def generate_data():
  sensors = get_sensors()
  if not sensors:
    return 
  
  # MQTT setup
  client = mqtt.Client(CallbackAPIVersion.VERSION2)  
  client.on_connect = on_connect  
  try:
    client.connect("localhost", 1883)
    client.loop_start()
  except Exception as e:
    print(f"{e}")
    return
  try:
    while True:
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
      time.sleep(DELAY)
  except KeyboardInterrupt:
    print("\ndata generation interrupted")
  finally:
    client.loop_stop()
    client.disconnect()
      

if __name__ == "__main__":
  generate_data()