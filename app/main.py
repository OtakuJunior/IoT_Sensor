from fastapi import FastAPI, HTTPException, Depends
from app.database import engine, session_local, Base
from sqlalchemy.orm import Session
from app.models import alert, asset, location, sensor_data, sensor, user
from app.routes import users, sensors, sensor_data, locations, assets, alerts
from app.config import settings

app = FastAPI(
    docs_url= None if settings.PRODUCTION else '/docs',
    redoc_url= None if settings.PRODUCTION else '/redoc',
    openapi_url= None if settings.PRODUCTION else "/openapi.json"
)
app.include_router(users.router)
app.include_router(sensors.router)
app.include_router(sensor_data.router)
app.include_router(locations.router)
app.include_router(assets.router)
app.include_router(alerts.router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Success"}