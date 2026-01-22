from sqlalchemy.orm import Session
from app.schemas.asset import AssetCreate
from app.models.asset import Asset as Asset_Model 

def CreateAsset(db : Session, asset : AssetCreate):

  db_asset = Asset_Model(
  qr_id = asset.qr_id,
  name = asset.name,
  category = asset.category,
  last_maintenance = asset.last_maintenance,
  location_id = asset.location_id
  )

  db.add(db_asset)
  db.commit()
  db.refresh(db_asset)

  return db_asset

def GetAsset(db : Session, asset_id : int):
  return db.query(Asset_Model).filter(Asset_Model.id == asset_id).first()

def DeleteAsset(db: Session, asset_id : int):
  db_asset = db.query(Asset_Model).filter(Asset_Model.id == asset_id).first()
  
  if db_asset:
    db.delete(db_asset)
    db.commit()
    return True
  
  return False