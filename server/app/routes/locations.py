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

@router.post("", status_code=status.HTTP_201_CREATED)
def create_location(location : LocationCreate, db : Session = Depends(get_db)):
  return location_crud.create_location(db=db, location=location)

@router.get("")
def get_locations(db : Session = Depends(get_db)):
  return location_crud.get_locations(db=db)