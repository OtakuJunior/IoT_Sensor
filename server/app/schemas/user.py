from pydantic import BaseModel, EmailStr, ConfigDict
from app.services.enums import UserRole

# Base user model 
class UserBase(BaseModel):
  name: str
  email : EmailStr
  phone_number : str | None = None
  role : UserRole
# Model to create an user
class UserCreate(UserBase): 
  pass

# Model to read an user
class User(UserBase):
  id : str

  model_config = ConfigDict(from_attributes=True)
