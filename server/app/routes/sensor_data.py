from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import sensor_data as sensor_data_crud
from app.crud import sensor as sensor_crud
from app.schemas.query_series import QuerySeriesBase
from app.timescale import query_series
from app.schemas.sensor_data import SensorDataCreate, SensorData
from datetime import datetime, timedelta, timezone

router = APIRouter(
  prefix="/sensor_data",
  tags=['Sensor_data'],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=SensorData)
def create_sensor_data(sensor_data : SensorDataCreate, db : Session = Depends(get_db)):
  sensor_data, alert = sensor_data_crud.create_sensor_data(db=db, sensor_data=sensor_data)
  return sensor_data

@router.get("/{sensor_id}/history")
def get_sensor_data_history(
    sensor_id: str,
    params: QuerySeriesBase = Depends(),
    db: Session = Depends(get_db)
):
    db_sensor = sensor_crud.get_sensor(db=db, sensor_id=sensor_id)
    if db_sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found")

    now = datetime.now(timezone.utc)
    from_time = params.from_time if params.from_time else now - timedelta(minutes=30)
    end_time = params.end_time if params.end_time else now

    result = query_series(
        sensor_id=sensor_id,
        bucket_ms=params.bucket_ms or 0,
        from_time=from_time,
        end_time=end_time
    )
    
    return [dict(row._mapping) for row in result]

@router.get('/{sensor_id}/kpis')
def get_sensor_kpis(sensor_id : str, from_time : datetime | None = None, to_time : datetime | None = None, db : Session = Depends(get_db)):
  return sensor_data_crud.get_sensor_kpis(db=db, sensor_id=sensor_id, from_time=from_time, to_time=to_time)


@router.get('/{sensor_data_id}', response_model=SensorData)
def get_sensor_data(sensor_data_id : str, db : Session = Depends(get_db)):
  db_sensor_data = sensor_data_crud.get_sensor_data(db=db, sensor_data_id=sensor_data_id)
  if db_sensor_data is None:
    raise HTTPException(status_code=404, detail="Data not found")
  return db_sensor_data





