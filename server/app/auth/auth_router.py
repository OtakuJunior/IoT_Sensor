from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.controller import AuthController
from app.schemas.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()

@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user) ):
    return current_user

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    return AuthController.logout(credentials)