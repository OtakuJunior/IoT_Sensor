from sqlalchemy.orm import Session
from app.schemas.sensor import SensorCreate, SensorUpdate
from app.models.sensor import Sensor as Sensor_Model

def CreateSensor(db : Session, sensor : SensorCreate ):
  db_sensor = Sensor_Model(
  name = sensor.name,
  type = sensor.type,
  unit = sensor.unit,
  min_warning = sensor.min_warning,
  max_warning = sensor.max_warning,
  min_critical = sensor.min_critical,
  max_critical = sensor.max_critical,
  location_id = sensor.location_id
  )

  db.add(db_sensor)
  db.commit()
  db.refresh(db_sensor)

  return db_sensor

def GetSensor(db: Session, sensor_id : int):
  return db.query(Sensor_Model).filter(Sensor_Model.id == sensor_id).first()

def DeleteSensor(db: Session, sensor_id : int):
  db_sensor = db.query(Sensor_Model).filter(Sensor_Model.id == sensor_id).first()
  
  if db_sensor:
    db.delete(db_sensor)
    db.commit()
    return True
  
  return False

def UpdateSensor(db : Session, sensor_id : int, updated_sensor : SensorUpdate):
  db_sensor = db.query(Sensor_Model).filter(Sensor_Model.id == sensor_id).first()

  if db_sensor:
    update_data = updated_sensor.model_dump(exclude_unset=True)

    for key, value in update_data.items():
      setattr(db_sensor, key, value) 
      
    db.commit()
    db.refresh(db_sensor)

    return db_sensor
  
  return None
