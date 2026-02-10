from fastapi_mqtt import FastMQTT, MQTTConfig
from app.config import settings
import json
from app.services.ws import manager


mqtt_config = MQTTConfig(
    host=settings.MQTT_BROKER,
    port=settings.MQTT_PORT,
    keepalive=60,
    username=None,
    password=None
)
mqtt = FastMQTT(
    config=mqtt_config
    )
print("⚙️ MQTT Handler chargé") 

@mqtt.on_connect()
def connect(client, flags: int, rc: int, properties = None):
    if (rc == 0):
        print(f"🔌 FastAPI MQTT: Connected with rc={rc}") 
        client.subscribe(settings.TOPIC_PREFIX)  
        print(f"📡 FastAPI MQTT: Subscribed to {settings.TOPIC_PREFIX}")
        client.subscribe("alerts/+")
        print("🚨 Subscribed to alerts/+")

@mqtt.on_message()
async def message(client, topic, payload, qos, properties):
    data = json.loads(payload.decode())
    sensor_id = str(data.get("sensor_id"))

    if topic.startswith("alerts/"):
        data["is_alert"] = True 
        await manager.broadcast(data, sensor_id=sensor_id)
        return

    print(f"📥 MQTT reçu: {data}")
    await manager.broadcast(data, sensor_id=sensor_id)
    print(f"📤 Broadcast à {len(manager.active_connections)} clients") 