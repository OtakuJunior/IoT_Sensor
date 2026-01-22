from pydantic import BaseModel, ConfigDict

# Base sensor model
class SensorBase(BaseModel):
  name : str
  type : str
  unit : str
  min_warning : float | None = None
  max_warning : float | None = None
  min_critical : float | None = None
  max_critical : float | None = None
  location_id : int

# Model to create a sensor
class SensorCreate(SensorBase):
  pass

# Model to read a sensor
class Sensor(SensorBase): 
  id : int

  model_config = ConfigDict(from_attributes=True)

# Model to update a sensor
class SensorUpdate(BaseModel): 
  name : str | None = None
  type : str | None = None
  unit : str | None = None
  min_warning : float | None = None
  max_warning : float | None = None
  min_critical : float | None = None
  max_critical : float | None = None
  location_id : int | None = None