import time 
import random
import requests
from datetime import datetime
import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion
import json

API_URL = "http://127.0.0.1:8000"
DELAY = 1

def get_sensors():
  response = requests.get(f"{API_URL}/sensors")
  if response.status_code == 200:
    sensors = response.json()
    return [sensor["id"] for sensor in sensors]
  return []

def on_connect(client, userdata, flags, reason_code, properties = None):
  if reason_code == 0:
    print(f"Connected with result code {reason_code}")

def generate_data():
  sensors_id = get_sensors()
  if not sensors_id:
    return 
  
  # MQTT setup
  client = mqtt.Client(CallbackAPIVersion.VERSION2)  
  client.on_connect = on_connect
  client.connect("localhost", 1883)
  client.loop_start()

  while True:
    try:
      for s_id in sensors_id:
        val = 20.0 + random.uniform(-5, 5)
        if random.random() < 0.05:
          val = 50.0 + random.uniform(0, 25)

        payload = {
          "sensor_id": s_id,
          "value": round(val, 2),
          "time": datetime.now().isoformat() 
        }

        topic = f"factory/sensors/{s_id}/data"
        client.publish(topic, json.dumps(payload), qos=1)
      print("data generated at ", datetime.now().isoformat())
      time.sleep(DELAY)
    except KeyboardInterrupt:
      client.loop_stop()
      client.disconnect()
      print("\ndata generation interrupted")
      break

if __name__ == "__main__":
  generate_data()