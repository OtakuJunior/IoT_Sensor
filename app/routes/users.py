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
def CreateUserEP(user : UserCreate, db : Session = Depends(get_db)):
  return user_crud.CreateUser(db = db, user = user)

@router.get("/{user_id}")
def GetUserEP(user_id : int, db : Session = Depends(get_db)):
  db_user = user_crud.GetUser(db=db, user_id=user_id)
  if db_user is None:
    raise HTTPException(status_code=404, detail="User not found")
  return db_user

@router.delete("/{user_id}", status_code=204)
def DeleteUserEP(user_id : int, db : Session = Depends(get_db)):
  deleteUser = user_crud.DeleteUser(db=db, user_id=user_id)
  if deleteUser is None:
    raise HTTPException(status_code=404, detail="User not found")
  if deleteUser:
    return {'message' : 'User deleted'} 
  return False 