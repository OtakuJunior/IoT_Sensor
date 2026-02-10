from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from app import database
from app import models
from app.routes import users, sensors, sensor_data, locations, assets, alerts
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.timescale import init_timescale
from app.services.ws import manager
from app.services.mqtt_handler import mqtt


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("DEBUG: 🟢 Début du lifespan")
    await mqtt.mqtt_startup()
    try:
        database.Base.metadata.create_all(bind=database.engine)
        init_timescale()
    except Exception as e:
        print(f"ERROR: {e}")
    
    try:
        mqtt.mqtt_startup
    except Exception as e:
        print(f"ERROR: {e}")
    
    yield
    mqtt.mqtt_shutdown()

app = FastAPI(
    docs_url= None if settings.PRODUCTION else '/docs',
    redoc_url= None if settings.PRODUCTION else '/redoc',
    openapi_url= None if settings.PRODUCTION else "/openapi.json",
    lifespan=lifespan
)
origins = [
    "http://localhost:8080",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(sensors.router)
app.include_router(sensor_data.router)
app.include_router(locations.router)
app.include_router(assets.router)
app.include_router(alerts.router)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content=None, status_code=204)

@app.get("/")
def read_root():
    return {"Iot sensor project backend is running"}

@app.websocket("/ws/{sensor_id}")
async def websocket_endpoint(websocket: WebSocket, sensor_id : str):
    await manager.connect(websocket, sensor_id=sensor_id)
    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        manager.disconnect(websocket, sensor_id=sensor_id)