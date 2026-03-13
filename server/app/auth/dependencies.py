from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.auth.controller import AuthController
from app.database import get_db
import app.crud.user as crud_user
from app.schemas.user import UserCreate
from app.services.enums import UserRole

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    user_info = AuthController.get_current_user(credentials)
    
    user = crud_user.get_user(db, user_info.id)

    if not user:
        user = crud_user.get_user_by_email(db, user_info.email)
        if user:
            user.id = user_info.id
            db.commit()
            db.refresh(user)
        else:
            roles = user_info.realm_access.get("roles", [])
            roles_lower = [r.lower() for r in roles]

            assigned_role = UserRole.ANALYST
            if "master" in roles_lower:
                assigned_role = UserRole.MASTER
            elif "admin" in roles_lower:
                assigned_role = UserRole.ADMIN

            new_user_data = UserCreate(
                id=user_info.id,
                name=user_info.name,
                email=user_info.email,
                role=assigned_role,
                phone_number=None 
            )

            try:
                user = crud_user.create_user(db, user=new_user_data)
            except Exception:
                db.rollback() 
                user = crud_user.get_user(db, user_info.sub)
                if not user:
                    raise HTTPException(status_code=500, detail="User creation conflict")
    return user

def require_admin(user=Depends(get_current_user)):
    if user.role not in ["ADMIN", "MASTER"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def require_master(user=Depends(get_current_user)):
    if user.role != "MASTER":
        raise HTTPException(status_code=403, detail="Master access required")
    return user