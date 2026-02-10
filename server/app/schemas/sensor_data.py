from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Base sensor data model
class SensorDataBase(BaseModel):
  value : float
  time : datetime 
  sensor_id : str

# Model to create a sensor data
class SensorDataCreate(SensorDataBase):
  pass

# Model to read a sensor data
class SensorData(SensorDataBase):
  id : str
  model_config = ConfigDict(from_attributes=True)