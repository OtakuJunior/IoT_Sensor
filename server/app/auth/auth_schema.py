from pydantic import BaseModel

class TokenRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class UserInfo(BaseModel):
    sub: str
    preferred_username: str
    email: str
    realm_access: dict | None = None