from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Literal

# Base alert model
class AlertBase(BaseModel):
  sensor_id : int
  severity : Literal['Warning', 'Critical']
  message : str | None = None
  time : datetime
  is_resolved : bool = False

# Model to create an alert
class AlertCreate(AlertBase): 
  pass

# Model to read an alert 
class Alert(AlertBase):
  id : int 

  model_config = ConfigDict(from_attributes=True)

# Model to update an alert
class AlertUpdate(BaseModel):
  severity : Literal['Warning', 'Critical'] | None = None
  message : str | None = None
  is_resolved : bool | None = None


