from sqlalchemy.orm import Session
from app.models.sensor_data import SensorData as sensor_data_model
from app.models.alert import Alert as alert_model
from app.models.sensor import Sensor as sensor_model
from datetime import datetime, timedelta
from app.crud import alert as alert_crud

"""
We don't compare the exact value but an average of the value and the 2 previous values 
It is called the moving average and it prevents triggering an alert for isolated aberrant values
"""
def average_value(db : Session, sensor : sensor_model, limit : int) -> float:
  last_values = db.query(sensor_data_model).filter(sensor_data_model.sensor_id == sensor.id).order_by(sensor_data_model.time.desc()).limit(limit).all()
  values = [h.value for h in last_values] 
  average = sum(values)/len(values)
  return average

"""
We compare the value (average) with the sensor's threshold 
it returns the severity and a message or None
"""
def check_value(value : float, sensor : sensor_model):
  if sensor.min_critical is not None and value <= sensor.min_critical :
    return "Critical", "Low", f"Low critical value detected : {value}"
  
  if sensor.max_critical is not None and value >= sensor.max_critical :
    return "Critical", "High", f"High critical value detected : {value}"
  
  if sensor.min_warning is not None and value <= sensor.min_warning :
    return "Warning", "Low", f"Low warning value detected : {value}"
  
  if sensor.max_warning is not None and value >= sensor.max_warning :
    return "Warning", "High", f"High warning value detected : {value}"
  
  return None, None, None

# return the latest unresolved alert for the given sensor 
def check_previous_alert(db : Session, sensor : sensor_model):
  return db.query(alert_model).filter(alert_model.sensor_id == sensor.id,alert_model.is_resolved == False).order_by(alert_model.time.desc()).first()

"""
Determine if a new alert should be created based on the previous one 
A new alert is triggered if : 
  - the lastet alert is older than 24 hours (can be longer or shorter)
  - If the new alert is a critical one and the previous is a warning 
"""
def check_alert_is_ok(severity : str, previous_alert : alert_model):
  minutes_delay = 30
  time_passed  = datetime.now() - timedelta(minutes=minutes_delay)
  if previous_alert.time < time_passed:
    return True
  if previous_alert.severity == "Warning" and severity == "Critical":
    return True
  return False

# The main orchestrator of the alert triggering system
def create_alert_if_severity(db : Session, sensor : sensor_model) -> None:
  # We compute the average of the three last data
  average = average_value(db=db, sensor=sensor, limit=3)

  # We check wether the average exceeds the thresholds
  severity, alert_direction, alert_message = check_value(average, sensor)

  #We check if there is already an alert
  previous_alert = check_previous_alert(db = db, sensor = sensor)

  if severity: #If the value triggers an alert

    check_alert = False
    if previous_alert: #If an alert already exists

      # We check if we need to create a new alert
      check_alert = check_alert_is_ok(severity, previous_alert)

    else: #If there is not an alert
      check_alert = True

    #If we need to create a new alert (cooldown passed or excalation)
    if check_alert: 

      # And if there was an active alert
      if previous_alert:

        #We resolve the previous alert to avoid duplicate
        previous_alert.is_resolved = True

      alert = alert_model(
        sensor_id = sensor.id,
        severity = severity,
        direction = alert_direction,
        message = f"{severity} value on the {sensor.name}, {alert_message}",
        time = datetime.now(),
        is_resolved = False)
      
      alert_crud.create_alert(db=db, alert=alert)

  # if the value does not exceed threshold, there is not severity
  else: 

    #We check if there is an alert still active 
    if previous_alert:
      resolve_alert = can_resolve_alert(sensor=sensor, previous_alert=previous_alert, value=average)
      
      if resolve_alert:
        previous_alert.is_resolved = True

        db.commit()
        db.refresh(previous_alert)

def can_resolve_alert(sensor : sensor_model, previous_alert : alert_model, value : float):
    # Determine the type of the previous alert (High value vs Low value)
    is_high_alert = previous_alert.direction == "High"
    is_low_alert = previous_alert.direction == "Low"
    
    # Determine severity level to pick the right threshold (Critical or Warning)
    is_critical =  previous_alert.severity == "Critical"
    
    # Retrieve the reference threshold that triggered the alert
    threshold = None

    if is_high_alert:
      if is_critical:
        threshold = sensor.max_critical  
      else: 
        threshold = sensor.max_warning

    elif is_low_alert:
      if is_critical :
        threshold = sensor.min_critical 
      else: 
        threshold = sensor.min_warning

    # If configuration changed and threshold is missing, resolve by default to avoid stuck alerts
    if threshold is None:
        return True
    
    if is_high_alert:
        return value < (threshold * 0.95)
        
    if is_low_alert:
        return value > (threshold * 1.05)

    return False

  