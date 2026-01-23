from sqlalchemy.orm import Session
from app.schemas.sensor_data import SensorDataCreate
from app.models.sensor_data import SensorData as SensorData_Model
from app.crud import sensor as sensor_crud
from app.services import sensor_data_processing as sd_process
from datetime import datetime

def CreateSensorData(db : Session, sensor_data : SensorDataCreate):
  db_sensor_data = SensorData_Model(
  sensor_id = sensor_data.sensor_id,
  value = sensor_data.value,
  time = sensor_data.time
  )
  db.add(db_sensor_data)
  db.commit()
  db.refresh(db_sensor_data)

  sensor = sensor_crud.GetSensor(db=db, sensor_id=db_sensor_data.sensor_id)
  if sensor :
    sd_process.create_alert_if_severity(db=db, sensor=sensor)
  return db_sensor_data

def GetSensorData(db: Session, sensor_data_id : int):
  return db.query(SensorData_Model).filter(SensorData_Model.id == sensor_data_id).first()

def GetSensorDataHistory(db : Session, sensor_id : int, start_time : datetime, end_time : datetime = None):
  sensor_data = db.query(SensorData_Model).filter(SensorData_Model.sensor_id == sensor_id)
  if start_time is not None:
      query = query.filter(SensorData_Model.time >= start_time)
  if end_time is not None:
    sensor_data = sensor_data.filter(SensorData_Model.time <= end_time)
  return sensor_data.order_by(SensorData_Model.time.asc()).all()