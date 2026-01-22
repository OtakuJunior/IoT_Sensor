from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import alert as alert_crud
from app.schemas.alert import AlertCreate, Alert, AlertUpdate

router = APIRouter(
  prefix="/alerts",
  tags=['Alerts'],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def CreateAlertEP(alert : AlertCreate, db : Session = Depends(get_db)):
  return alert_crud.CreateAlert(db=db, alert=alert)

@router.patch("/{alert_id}/resolve")
def ResolvedAlertEP(alert_id : int, updated_alert : AlertUpdate, db : Session = Depends(get_db)):
  db_alert = alert_crud.UpdateAlert(db=db, alert_id=alert_id, updated_alert=updated_alert)
  if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
  return db_alert

@router.get("/unresolved", response_model=list[Alert])
def GetUnresolvedAlertsEP(db : Session = Depends(get_db)):
  return alert_crud.GetUnresolvedAlerts(db)

@router.get('/{alert_id}')
def GetAlertEP(alert_id : int, db : Session = Depends(get_db)):
  db_alert = alert_crud.GetAlert(db=db, alert_id=alert_id)
  if db_alert is None:
    raise HTTPException(status_code=404, detail="Alert not found")
  return db_alert

@router.get("/{sensor_id}")
def GetAlertsBySensorEP(sensor_id: int, db: Session = Depends(get_db)):
    return alert_crud.GetAlertsBySensor(db=db, sensor_id=sensor_id)



