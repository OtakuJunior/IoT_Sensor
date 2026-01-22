from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import asset as asset_crud
from app.schemas.asset import AssetCreate

router = APIRouter(
  prefix="/assets",
  tags=['Assets'],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def CreateAssetEP(asset : AssetCreate, db : Session = Depends(get_db)):
  return asset_crud.CreateAsset(db=db, asset=asset)

@router.get('/{asset_id}')
def GetAssetEP(asset_id : int, db : Session = Depends(get_db)):
  db_asset = asset_crud.GetAsset(db=db, asset_id=asset_id)
  if db_asset is None:
    raise HTTPException(status_code=404, detail="Asset not found")

  return db_asset