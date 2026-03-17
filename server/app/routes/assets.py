from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import asset as asset_crud
from app.schemas.asset import AssetCreate, Asset, AssetUpdate
from app.schemas.sensor import Sensor
from app.auth.dependencies import require_admin, require_master

router = APIRouter(
  prefix="/assets",
  tags=['Assets'],
  responses={404: {"description": "Not found"}}
)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_asset(asset : AssetCreate, db : Session = Depends(get_db), admin: dict = Depends(require_admin)):
  return asset_crud.create_asset(db=db, asset=asset)

@router.get('/{asset_id}', response_model=Asset)
def get_asset(asset_id : str, db : Session = Depends(get_db)):
  db_asset = asset_crud.get_asset_by_id(db=db, asset_id=asset_id)
  if db_asset is None:
    raise HTTPException(status_code=404, detail="Asset not found")

  return db_asset

@router.get('/qr/{qr_id}', response_model=Asset)
def get_asset_by_qr(qr_id : str, db : Session = Depends(get_db), admin: dict = Depends(require_admin)):
  db_qr = asset_crud.get_asset_by_qr(db=db, qr_id=qr_id)
  if db_qr is None:
    raise HTTPException(status_code=404, detail="Qr not found")
  
@router.post('/{asset_id}/assign/{sensor_id}', response_model=Sensor)
def assign_sensor_to_asset(asset_id : str, sensor_id : str, db : Session = Depends(get_db), admin: dict = Depends(require_admin)):
  assigned_sensor = asset_crud.assign_sensor_to_asset(db=db, sensor_id=sensor_id, asset_id=asset_id)
  if assigned_sensor is None : 
    raise HTTPException(status_code=404, detail='Sensor or Asset not Found')
  return assigned_sensor

@router.get('', response_model=list[Asset])
def get_assets(db : Session = Depends(get_db)):
  return asset_crud.get_assets(db=db)

@router.patch("/{asset_id}", response_model=AssetUpdate)
def update_asset(updated_asset : AssetUpdate, asset_id : str, db : Session = Depends(get_db), admin: dict = Depends(require_admin)):
  db_asset = asset_crud.update_asset(db=db, asset_id=asset_id, updated_asset=updated_asset)
  if db_asset is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
  return db_asset

@router.delete("/{asset_id}")
def delete_sensor(asset_id: str, db:Session = Depends(get_db), admin: dict = Depends(require_master)):
  return asset_crud.delete_asset(db=db, asset_id=asset_id)