from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from app import database
from app import models
from app.routes import users, sensors, sensor_data, locations, assets, alerts
from app.auth import auth_router
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.timescale import init_timescale, init_continuous_aggregates
from app.services.ws import manager
from app.services.mqtt_handler import mqtt
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

limiter = Limiter(
    key_func=get_remote_address, 
    default_limits=[f"{settings.RATE_LIMIT}/{settings.RATE_LIMIT_WINDOW}seconds"],
    storage_uri=settings.REDIS_URL 
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    await mqtt.mqtt_startup()
    database.Base.metadata.create_all(bind=database.engine)
    init_timescale()
    init_continuous_aggregates()


    yield  
    await mqtt.mqtt_shutdown()
    print("Shutting down the app")

app = FastAPI(
    docs_url= None if settings.PRODUCTION else '/docs',
    redoc_url= None if settings.PRODUCTION else '/redoc',
    openapi_url= None if settings.PRODUCTION else "/openapi.json",
    lifespan=lifespan,
    redirect_slashes=False
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware) 

origins = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost",
    "http://localhost:80"
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
app.include_router(auth_router.router)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content=None, status_code=204)

@app.get("/")
def read_root():
    return {"Iot sensor project backend is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket,):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        manager.disconnect(websocket)