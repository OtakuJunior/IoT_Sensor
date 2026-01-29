from sqlalchemy.orm import Session
from app.schemas.sensor_data import SensorDataCreate
from app.models.sensor_data import SensorData as sensor_data_model
from app.crud import sensor as sensor_crud
from app.services import sensor_data_processing as sd_process
from datetime import datetime

def create_sensor_data(db : Session, sensor_data : SensorDataCreate):
  db_sensor_data = sensor_data_model(
  sensor_id = sensor_data.sensor_id,
  value = sensor_data.value,
  time = sensor_data.time
  )
  db.add(db_sensor_data)
  db.commit()
  db.refresh(db_sensor_data)

  sensor = sensor_crud.get_sensor(db=db, sensor_id=db_sensor_data.sensor_id)
  if sensor :
    sd_process.create_alert_if_severity(db=db, sensor=sensor)
  return db_sensor_data

def get_sensor_data(db: Session, sensor_data_id : str):
  return db.query(sensor_data_model).filter(sensor_data_model.id == sensor_data_id).first()

def get_sensor_data_history(db : Session, sensor_id : str, start_time : datetime, end_time : datetime = None):
  sensor_data = db.query(sensor_data_model).filter(sensor_data_model.sensor_id == sensor_id)
  if start_time is not None:
      query = query.filter(sensor_data_model.time >= start_time)
  if end_time is not None:
    sensor_data = sensor_data.filter(sensor_data_model.time <= end_time)
  return sensor_data.order_by(sensor_data_model.time.asc()).all()