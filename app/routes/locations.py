from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import location as location_crud
from app.schemas.location import LocationCreate

router = APIRouter(
  prefix="/locations",
  tags=['Locations'],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def CreateLocationEP(location : LocationCreate, db : Session = Depends(get_db)):
  return location_crud.CreateLocation(db=db, location=location)

@router.get('/{location_id}')
def GetLocationEP(location_id : int, db : Session = Depends(get_db)):
  db_location = location_crud.GetLocation(db=db, location_id=location_id)
  if db_location is None:
    raise HTTPException(status_code=404, detail="Location not found")
  return db_location