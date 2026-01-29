from sqlalchemy.orm import Session
from app.schemas.sensor import SensorCreate, SensorUpdate
from app.models.sensor import Sensor as sensor_model

def create_sensor(db : Session, sensor : SensorCreate ):
  db_sensor = sensor_model(
  name = sensor.name,
  sensor_type = sensor.sensor_type,
  unit = sensor.unit,
  status = sensor.status,
  min_warning = sensor.min_warning,
  max_warning = sensor.max_warning,
  min_critical = sensor.min_critical,
  max_critical = sensor.max_critical,
  location_id = sensor.location_id,
  asset_id = sensor.asset_id
  )

  db.add(db_sensor)
  db.commit()
  db.refresh(db_sensor)

  return db_sensor

def get_sensor(db: Session, sensor_id : str):
  return db.query(sensor_model).filter(sensor_model.id == sensor_id).first()

def delete_sensor(db: Session, sensor_id : str):
  db_sensor = db.query(sensor_model).filter(sensor_model.id == sensor_id).first()
  
  if db_sensor:
    db.delete(db_sensor)
    db.commit()
    return True
  
  return False

def update_sensor(db : Session, sensor_id : str, updated_sensor : SensorUpdate):
  db_sensor = db.query(sensor_model).filter(sensor_model.id == sensor_id).first()

  if db_sensor:
    update_data = updated_sensor.model_dump(exclude_unset=True)

    for key, value in update_data.items():
      setattr(db_sensor, key, value) 
      
    db.commit()
    db.refresh(db_sensor)

    return db_sensor
  
  return None
