from pydantic import BaseModel, ConfigDict

# Base location model 
class LocationBase(BaseModel):
  name : str

# Model to create a location
class LocationCreate(LocationBase):
  pass

# Model to read a location
class Location(LocationBase): 
  id: str

  model_config = ConfigDict(from_attributes=True)