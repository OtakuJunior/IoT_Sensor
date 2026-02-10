from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import user as user_crud
from app.schemas.user import UserCreate

router = APIRouter(
  prefix="/users",
  tags=["Users"],
  responses={404: {"description": "Not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user : UserCreate, db : Session = Depends(get_db)):
  return user_crud.create_user(db = db, user = user)

@router.get("/{user_id}")
def get_user(user_id : str, db : Session = Depends(get_db)):
  db_user = user_crud.get_user(db=db, user_id=user_id)
  if db_user is None:
    raise HTTPException(status_code=404, detail="User not found")
  return db_user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id : str, db : Session = Depends(get_db)):
  deleteUser = user_crud.delete_user(db=db, user_id=user_id)
  if deleteUser is None:
    raise HTTPException(status_code=404, detail="User not found")
  if deleteUser:
    return {'message' : 'User deleted'} 
  return False 