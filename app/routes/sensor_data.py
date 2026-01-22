from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import sensor_data as sensor_data_crud
from app.crud import sensor as sensor_crud
from app.schemas.sensor_data import SensorDataCreate, SensorData
from datetime import datetime

router = APIRouter(
  prefix="/sensor_data",
  tags=['Sensor_data'],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=SensorData)
def CreateSensorDataEP(sensor_data : SensorDataCreate, db : Session = Depends(get_db)):
  return sensor_data_crud.CreateSensorData(db=db, sensor_data=sensor_data)

@router.get("/{sensor_id}/history", response_model=list[SensorData])
def GetSensorDataHistoryEP(sensor_id : int, start_time : datetime = None, end_time : datetime = None, db : Session = Depends(get_db)):
  db_sensor = sensor_crud.GetSensor(db=db, sensor_id=sensor_id)
  if db_sensor is None:
    raise HTTPException(status_code=404, detail="Sensor not found")
  return sensor_data_crud.GetSensorDataHistory(db=db, sensor_id=sensor_id, start_time=start_time, end_time=end_time)

@router.get('/{sensor_data_id}', response_model=SensorData)
def GetSensorDataEP(sensor_data_id : int, db : Session = Depends(get_db)):
  db_sensor_data = sensor_data_crud.GetSensorData(db=db, sensor_data_id=sensor_data_id)
  if db_sensor_data is None:
    raise HTTPException(status_code=404, detail="Data not found")
  return db_sensor_data


