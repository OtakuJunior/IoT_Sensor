from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import sensor as sensor_crud
from app.schemas.sensor import SensorCreate, SensorUpdate, Sensor
from app.services import enums

router = APIRouter(
  prefix="/sensors",
  tags=["Sensors"], 
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_sensor(sensor : SensorCreate, db : Session = Depends(get_db)):
  return sensor_crud.create_sensor(db = db, sensor = sensor)

@router.patch("/{sensor_id}", response_model=SensorUpdate)
def update_sensor(updated_sensor : SensorUpdate, sensor_id : str, db : Session = Depends(get_db)):
  db_sensor = sensor_crud.update_sensor(db=db, sensor_id=sensor_id, updated_sensor=updated_sensor)
  if db_sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
  return db_sensor

@router.get("/{sensor_id}")
def get_sensor(sensor_id : str, db : Session = Depends(get_db)):
  db_sensor = sensor_crud.get_sensor(db=db, sensor_id=sensor_id)
  if db_sensor is None:
    raise HTTPException(status_code=404, detail="Sensor not found")
  return db_sensor

@router.get("/", response_model=list[Sensor])
def get_sensors(sensor_type : enums.SensorType | None = None, sensor_status: enums.SensorStatus | None = None, db : Session = Depends(get_db)):
  return sensor_crud.get_sensors(db=db, sensor_type=sensor_type, sensor_status=sensor_status)