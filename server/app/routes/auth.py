from fastapi import APIRouter, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.controller import AuthController
from app.schemas.auth import TokenResponse, UserInfo

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()

@router.post("/login", response_model=TokenResponse)
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    return AuthController.login(username, password)

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