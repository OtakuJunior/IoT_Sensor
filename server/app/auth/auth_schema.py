from pydantic import BaseModel, ConfigDict, Field

class TokenRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class UserInfo(BaseModel):
    id: str = Field(alias="sub")
    name: str = Field(alias="preferred_username")
    email: str
    realm_access: dict | None = None

    model_config = ConfigDict(from_attributes=True)