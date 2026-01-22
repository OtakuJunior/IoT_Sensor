from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import sensor as sensor_crud
from app.schemas.sensor import SensorCreate, SensorUpdate

router = APIRouter(
  prefix="/sensors",
  tags=["Sensors"], 
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def CreateSensorEP(sensor : SensorCreate, db : Session = Depends(get_db)):
  return sensor_crud.CreateSensor(db = db, sensor = sensor)

@router.patch("/{sensor_id}", response_model=SensorUpdate)
def UpdateSensorEP(updated_sensor : SensorUpdate, sensor_id : int, db : Session = Depends(get_db)):
  db_sensor = sensor_crud.UpdateSensor(db=db, sensor_id=sensor_id, updated_sensor=updated_sensor)
  if db_sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
  return db_sensor


@router.get("/{sensor_id}")
def GetSensorEP(sensor_id : int, db : Session = Depends(get_db)):
  db_sensor = sensor_crud.GetSensor(db=db, sensor_id=sensor_id)
  if db_sensor is None:
    raise HTTPException(status_code=404, detail="Sensor not found")
  return db_sensor
