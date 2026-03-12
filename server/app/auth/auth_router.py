from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.controller import AuthController
from app.auth.auth_schema import UserInfo

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()

@router.get("/me", response_model=UserInfo)
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    return AuthController.get_current_user(credentials)

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    return AuthController.logout(credentials)