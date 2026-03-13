from sqlalchemy.orm import Session
from app.schemas.asset import AssetCreate
from app.models.asset import Asset as asset_model 
from app.models.sensor import Sensor as sensor_model
from app.schemas.asset import AssetUpdate

def create_asset(db : Session, asset : AssetCreate):

  db_asset = asset_model(
  name = asset.name,
  status = asset.status,
  last_maintenance = asset.last_maintenance,
  location_id = asset.location_id
  )

  db.add(db_asset)
  db.commit()
  db.refresh(db_asset)

  return db_asset

def get_asset_by_id(db : Session, asset_id : str): 
  return db.query(asset_model).filter(asset_model.id == asset_id).first()

def get_assets(db : Session):
  return db.query(asset_model).all()
  

def delete_asset(db: Session, asset_id : str):
  db_asset = db.query(asset_model).filter(asset_model.id == asset_id).first()
  
  if db_asset:
    db.delete(db_asset)
    db.commit()
    return True
  
  return False

def get_asset_by_qr(db : Session, qr_id : str):
  return db.query(asset_model).filter(asset_model.qr_id == qr_id).first()

def assign_sensor_to_asset(db : Session, sensor_id : str, asset_id : str):
  db_sensor = db.query(sensor_model).filter(sensor_model.id == sensor_id).first()
  db_asset = db.query(asset_model).filter(asset_model.id == asset_id).first()

  if db_sensor is None or db_asset is None : 
    return None
  
  db_sensor.asset_id = asset_id

  db.commit()
  db.refresh(db_sensor)

  return db_sensor

def update_asset(db: Session, asset_id: str, updated_asset: AssetUpdate):
    db_asset = db.query(asset_model).filter(asset_model.id == asset_id).first()
    if not db_asset:
        return None
    try:
        update_data = updated_asset.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_asset, key, value)
        db.commit()
        db.refresh(db_asset)
        return db_asset
    except Exception as e:
        db.rollback()
        raise e
    
def delete_asset(db: Session, asset_id : str):
  db_asset = db.query(asset_model).filter(asset_model.id == asset_id).first()
  
  if db_asset:
    db.delete(db_asset)
    db.commit()
    return True
  
  return False
    
  