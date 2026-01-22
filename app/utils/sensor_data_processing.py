from sqlalchemy.orm import Session
from app.models.sensor_data import SensorData as SensorData_Model
from app.models.alert import Alert as Alert_Model
from app.models.sensor import Sensor as Sensor_Model
from datetime import datetime, timedelta
from app.crud import alert as alert_crud

"""
We don't compare the exact value but an average of the value and the 2 previous values 
It is called the moving average and it prevents triggering an alert for isolated aberrant values
"""
def average_value(db : Session, sensor : Sensor_Model, limit : int) -> float:
  last_values = db.query(SensorData_Model).filter(SensorData_Model.sensor_id == sensor.id).order_by(SensorData_Model.time.desc()).limit(limit).all()
  values = [h.value for h in last_values] 
  average = sum(values)/len(values)
  return average

"""
We compare the value (average) with the sensor's threshold 
it returns the severity and a message or None
"""
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

# return the latest unresolved alert for the given sensor 
def check_previous_alert(db : Session, sensor : Sensor_Model):
  return db.query(Alert_Model).filter(Alert_Model.sensor_id == sensor.id,Alert_Model.is_resolved == False).order_by(Alert_Model.time.desc()).first()

"""
Determine if a new alert should be created based on the previous one 
A new alert is triggered if : 
  - the lastet alert is older than 24 hours (can be longer or shorter)
  - If the new alert is a critical one and the previous is a warning 
"""
def check_alert_is_ok(severity : str, previous_alert : Alert_Model):
  hours_delay = 24
  time_passed  = datetime.now() - timedelta(hours=hours_delay)
  if previous_alert.time < time_passed:
    return True
  if previous_alert.severity == "Warning" and severity == "Critical":
    return True
  return False

# The main orchestrator of the alert triggering system
def create_alert_if_severity(db : Session, sensor : Sensor_Model) -> None:
  average = average_value(db=db, sensor=sensor, limit=3)
  severity, alert_message = check_value(average, sensor)
  if severity: #If the value triggers an alert
    previous_alert = check_previous_alert(db = db, sensor = sensor)
    check_alert = False
    if previous_alert: #If an alert already exists
      check_alert = check_alert_is_ok(severity, previous_alert)
    else: #If there is not an alert
      check_alert = True

    if check_alert:
      alert = Alert_Model(
        sensor_id = sensor.id,
        severity = f"{severity}",
        message = f"{severity} value on the sensor {sensor.id}, {alert_message}",
        time = datetime.now(),
        is_resolved = False)
      
      alert_crud.CreateAlert(db=db, alert=alert)