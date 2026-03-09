from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.auth.controller import AuthController
from app.database import get_db
from app import crud

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    user_info = AuthController.get_current_user(credentials)
    user = crud.user.get_user_by_keycloak_id(db, user_info.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    return user

def require_admin(user=Depends(get_current_user)):
    if user.role not in ["Admin", "Master"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def require_master(user=Depends(get_current_user)):
    if user.role != "Master":
        raise HTTPException(status_code=403, detail="Master access required")
    return user