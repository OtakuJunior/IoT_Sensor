from sqlalchemy.orm import Session
from app.schemas.alert import AlertCreate, AlertUpdate
from app.models.alert import Alert as Alert_Model

def CreateAlert(db : Session, alert : AlertCreate):
  db_alert = Alert_Model(
  severity = alert.severity,
  message = alert.message,
  time = alert.time,
  is_resolved = alert.is_resolved,
  sensor_id = alert.sensor_id
  )

  db.add(db_alert)
  db.commit()
  db.refresh(db_alert)

  return db_alert

def GetAlertsBySensor(db: Session, sensor_id: int):
    return db.query(Alert_Model).filter(Alert_Model.sensor_id == sensor_id).all()

def GetAlert(db : Session, alert_id : int):
  return db.query(Alert_Model).filter(Alert_Model.id == alert_id).first()

def GetUnresolvedAlerts(db : Session):
  return db.query(Alert_Model).filter(Alert_Model.is_resolved == False).all()

def UpdateAlert(db : Session, alert_id : int, updated_alert : AlertUpdate):
  db_alert = db.query(Alert_Model).filter(Alert_Model.id == alert_id).first()

  if db_alert:
    update_data = updated_alert.model_dump(exclude_unset=True)

    for key, value in update_data.items():
      setattr(db_alert, key, value) 
      
    db.commit()
    db.refresh(db_alert)

    return db_alert
  
  return None