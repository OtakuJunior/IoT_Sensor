import json
import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion
from sqlalchemy.orm import Session
from app.database import session_local
from app.crud import sensor_data as sensor_data_crud
from app.schemas.sensor_data import SensorDataCreate
from app.config import settings


#===============================================================================
#                               MQTT WORKER
#===============================================================================

def on_connect(client, userdata, flags, reason_code, properties = None):
  if reason_code == 0:
    print("Connected")
    client.subscribe(settings.TOPIC_PREFIX, qos=1)

def on_message(client, userdata, msg):
  db : Session = session_local()

  try:
    payload_str = msg.payload.decode()
    payload = json.loads(payload_str)
        
    sensor_data = SensorDataCreate(
      sensor_id=payload['sensor_id'],
      value=payload['value'],
      time=payload['time']
    )
    _, alert_created = sensor_data_crud.create_sensor_data(db=db, sensor_data=sensor_data)
    print(f"Saved: {sensor_data.value} at {sensor_data.time}")
    if alert_created:
      alert = {
        "sensor_id" : alert_created.sensor_id,
        "severity" : alert_created.severity,
        "direction" : alert_created.direction,
        "message" : alert_created.message,
        "time" : alert_created.time.isoformat(),
        "is_resolved" : alert_created.is_resolved
       }
      alert_topic = f"alerts/{alert_created.sensor_id}"
      client.publish(alert_topic, json.dumps(alert), qos=1)
      print(f"🚨 Alert published to {alert_topic}: {alert_created.severity}")

  except Exception as e:
    print(f"Error: {e}")
  finally:
    db.close()

def start_mqtt_listener():
    client = mqtt.Client(CallbackAPIVersion.VERSION2, client_id="Backend_Worker",clean_session=False)    
    client.on_connect = on_connect
    client.on_message = on_message
    
    client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, keepalive=60)
    client.loop_forever()

if __name__ == "__main__":
    start_mqtt_listener()
