from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import alert as alert_crud
from app.schemas.alert import AlertCreate, Alert, AlertUpdate
from app.models.sensor import Sensor as Sensor_Model


router = APIRouter(
  prefix="/alerts",
  tags=['Alerts'],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_alert(alert : AlertCreate, db : Session = Depends(get_db)):
  return alert_crud.create_alert(db=db, alert=alert)

@router.patch("/{alert_id}/resolve")
def resolved_alert(alert_id : str, updated_alert : AlertUpdate, db : Session = Depends(get_db)):
  db_alert = alert_crud.update_alert(db=db, alert_id=alert_id, updated_alert=updated_alert)
  if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
  return db_alert

@router.get('/{alert_id}')
def get_alert(alert_id : str, db : Session = Depends(get_db)):
  db_alert = alert_crud.get_alert(db=db, alert_id=alert_id)
  if db_alert is None:
    raise HTTPException(status_code=404, detail="Alert not found")
  return db_alert

@router.get("/", response_model= list[Alert])
def get_alerts(sensor_id: str | None = None, skip : int = 0, limit : int = 100, is_resolved : bool | None = None, db: Session = Depends(get_db)):
   return alert_crud.get_alerts(db=db, skip=skip, limit=limit, is_resolved=is_resolved, sensor_id=sensor_id)


