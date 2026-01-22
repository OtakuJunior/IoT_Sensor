from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.models.user import User as User_Model

def CreateUser(db: Session, user : UserCreate):
  db_user = User_Model(
    name = user.name,
    email = user.email,
    phone_number = user.phoneNumber,
    role = user.role
  )
  db.add(db_user)
  db.commit()
  db.refresh(db_user)

  return db_user

def GetUser(db: Session, user_id : int):
  return db.query(User_Model).filter(User_Model.id == user_id).first()

def DeleteUser(db: Session, user_id : int):
  db_user = db.query(User_Model).filter(User_Model.id == user_id).first()
  
  if db_user:
    db.delete(db_user)
    db.commit()
    return True
  
  return False