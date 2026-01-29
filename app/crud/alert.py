from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.schemas.alert import AlertCreate, AlertUpdate
from app.models.alert import Alert as alert_model

def create_alert(db : Session, alert : AlertCreate):
  db_alert = alert_model(
  severity = alert.severity,
  direction = alert.direction,
  message = alert.message,
  time = alert.time,
  is_resolved = alert.is_resolved,
  sensor_id = alert.sensor_id
  )

  db.add(db_alert)
  db.commit()
  db.refresh(db_alert)

  return db_alert

def get_alert(db: Session, alert_id: int):
    return db.query(alert_model).filter(alert_model.id == alert_id).first()

def get_alerts(db : Session, skip : int, limit : int, is_resolved : bool | None = None, sensor_id : str | None = None):
  query = db.query(alert_model)
  if sensor_id is not None :
    query = query.filter(alert_model.sensor_id == sensor_id)
  if is_resolved is not None:
    query = query.filter(alert_model.is_resolved == is_resolved)

  return query.order_by(desc(alert_model.time)).offset(skip).limit(limit).all()

def update_alert(db : Session, alert_id : str, updated_alert : AlertUpdate):
  db_alert = db.query(alert_model).filter(alert_model.id == alert_id).first()

  if db_alert:
    update_data = updated_alert.model_dump(exclude_unset=True)

    for key, value in update_data.items():
      setattr(db_alert, key, value) 
      
    db.commit()
    db.refresh(db_alert)

    return db_alert
  
  return None