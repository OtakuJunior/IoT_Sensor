from sqlalchemy.orm import Session
from app.schemas.location import LocationCreate
from app.models.location import Location as Location_Model

def CreateLocation(db : Session, location : LocationCreate):
  db_location = Location_Model(
    name = location.name
  )

  db.add(db_location)
  db.commit()
  db.refresh(db_location)

  return db_location

def GetLocation(db : Session, location_id : int):
  return db.query(Location_Model).filter(Location_Model.id == location_id).first()

def DeleteLocation(db: Session, location_id : int):
  db_location = db.query(Location_Model).filter(Location_Model.id == location_id).first()
  
  if db_location:
    db.delete(db_location)
    db.commit()
    return True
  
  return False