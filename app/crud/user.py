from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.models.user import User as user_model

def create_user(db: Session, user : UserCreate):
  db_user = user_model(
    name = user.name,
    email = user.email,
    phone_number = user.phoneNumber,
    role = user.role
  )
  db.add(db_user)
  db.commit()
  db.refresh(db_user)

  return db_user

def get_user(db: Session, user_id : str):
  return db.query(user_model).filter(user_model.id == user_id).first()

def delete_user(db: Session, user_id : str):
  db_user = db.query(user_model).filter(user_model.id == user_id).first()
  
  if db_user:
    db.delete(db_user)
    db.commit()
    return True
  
  return False