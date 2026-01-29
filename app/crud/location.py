from sqlalchemy.orm import Session
from app.schemas.location import LocationCreate
from app.models.location import Location as location_model

def create_location(db : Session, location : LocationCreate):
  db_location = location_model(
    name = location.name
  )

  db.add(db_location)
  db.commit()
  db.refresh(db_location)

  return db_location

def get_location(db : Session, location_id : str):
  return db.query(location_model).filter(location_model.id == location_id).first()

def delete_location(db: Session, location_id : str):
  db_location = db.query(location_model).filter(location_model.id == location_id).first()
  
  if db_location:
    db.delete(db_location)
    db.commit()
    return True
  
  return False