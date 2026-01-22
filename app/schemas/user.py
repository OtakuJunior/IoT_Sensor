from pydantic import BaseModel, EmailStr, ConfigDict

# Base user model 
class UserBase(BaseModel):
  name: str
  email : EmailStr
  phoneNumber : str | None = None
  role : str
# Model to create an user
class UserCreate(UserBase): 
  pass

# Model to read an user
class User(UserBase):
  id : int

  model_config = ConfigDict(from_attributes=True)
