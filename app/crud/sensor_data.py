from sqlalchemy.orm import Session
from app.schemas.sensor_data import SensorDataCreate
from app.models.sensor_data import SensorData as SensorData_Model
from app.models.alert import Alert as Alert_Model
from app.models.sensor import Sensor as Sensor_Model
from datetime import datetime, timedelta
from app.crud import alert as alert_crud
from app.crud import sensor as sensor_crud

def average_value(db : Session, sensor : Sensor_Model, limit : int) -> float:
  last_values = db.query(SensorData_Model).filter(SensorData_Model.sensor_id == sensor.id).order_by(SensorData_Model.time.desc()).limit(limit).all()
  values = [h.value for h in last_values] 
  average = sum(values)/len(values)
  return average

def check_value(value : float, sensor : Sensor_Model):
  if sensor.min_critical is not None and value <= sensor.min_critical :
    return "Critical", f"Low critical value detected : {value}"
  
  if sensor.max_critical is not None and value >= sensor.max_critical :
    return "Critical", f"High critical value detected : {value}"
  
  if sensor.min_warning is not None and value <= sensor.min_warning :
    return "Warning", f"Low warning value detected : {value}"
  
  if sensor.max_warning is not None and value >= sensor.max_warning :
    return "Warning", f"High warning value detected : {value}"
  
  return None, None

def check_previous_alert(db : Session, sensor : Sensor_Model):
  return db.query(Alert_Model).filter(Alert_Model.sensor_id == sensor.id,Alert_Model.is_resolved == False).order_by(Alert_Model.time.desc()).first()

def check_alert_is_ok(severity : str, previous_alert : Alert_Model):
  time_passed  = datetime.now() - timedelta(hours=24) 
  if previous_alert.time < time_passed:
    return True
  if previous_alert.severity == "Warning" and severity == "Critical":
    return True
  return False

def create_alert_if_severity(db : Session, sensor : Sensor_Model, value : float) -> None:
  average = average_value(db=db, sensor=sensor, limit=3)
  severity, alert_message = check_value(average, sensor)
  if severity:
    previous_alert = check_previous_alert(db = db, sensor = sensor)
    check_alert = False
    if previous_alert:
      check_alert = check_alert_is_ok(severity, previous_alert)
    else: 
      check_alert = True

    if check_alert:
      alert = Alert_Model(
        sensor_id = sensor.id,
        severity = f"{severity}",
        message = f"{severity} value on the sensor {sensor.id}, {alert_message}",
        time = datetime.now(),
        is_resolved = False)
      
      alert_crud.CreateAlert(db=db, alert=alert)

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
    create_alert_if_severity(db=db, sensor=sensor, value=db_sensor_data.value)
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