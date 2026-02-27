from sqlalchemy.orm import Session
from sqlalchemy import desc, text
from app.schemas.sensor_data import SensorDataCreate
from app.models.sensor_data import SensorData as sensor_data_model
from app.crud import sensor as sensor_crud
from app.services import sensor_data_processing as sd_process
from datetime import datetime, timedelta, timezone

def create_sensor_data(db : Session, sensor_data : SensorDataCreate):
  db_sensor_data = sensor_data_model(
  sensor_id = sensor_data.sensor_id,
  value = sensor_data.value,
  time = sensor_data.time
  )
  db.add(db_sensor_data)
  db.commit()
  db.refresh(db_sensor_data)

  alert = None
  sensor = sensor_crud.get_sensor(db=db, sensor_id=db_sensor_data.sensor_id)
  if sensor :
    alert = sd_process.create_alert_if_severity(db=db, sensor=sensor)
  return db_sensor_data, alert

def get_sensor_data(db: Session, sensor_data_id : str):
  return db.query(sensor_data_model).filter(sensor_data_model.id == sensor_data_id).first()

def get_sensor_kpis(db : Session, sensor_id : str, from_time : datetime | None = None, to_time : datetime | None = None):
  now_time = datetime.now(timezone.utc)
  start_time = from_time if from_time else now_time-timedelta(hours=1)
  end_time = to_time if to_time else now_time

  query = db.execute(text("""
    SELECT
      (SELECT value FROM sensor_data
      WHERE sensor_id = :sensor_id
      AND time BETWEEN :start_time AND :end_time
      ORDER BY time DESC LIMIT 1) as last, 
      min(value) as min,
      max(value) as max,
      avg(value) as avg
    FROM sensor_data
    WHERE sensor_id = :sensor_id
    AND time BETWEEN :start_time AND :end_time
  """), {"sensor_id" : sensor_id, "start_time" : start_time, "end_time" : end_time})

  kpi_values = query.fetchone()

  return {
    "sensor_id" : sensor_id,
    "last" : kpi_values.last if kpi_values.last else None, 
    "min" : kpi_values.min if kpi_values.min else None,
    "max" : kpi_values.max if kpi_values.max else None,
    "avg" : kpi_values.avg if kpi_values.avg else None
  }
  
