from pydantic import BaseModel, ConfigDict
from app.services.enums import SensorStatus, Units, SensorType
# Base sensor model
class SensorBase(BaseModel):
  name : str
  sensor_type : SensorType
  unit : Units
  status : SensorStatus = SensorStatus.ACTIVE
  min_warning : float | None = None
  max_warning : float | None = None
  min_critical : float | None = None
  max_critical : float | None = None
  location_id : str | None = None
  asset_id : str | None = None

# Model to create a sensor
class SensorCreate(SensorBase):
  pass

# Model to read a sensor
class Sensor(SensorBase): 
  id : str

  model_config = ConfigDict(from_attributes=True)

# Model to update a sensor
class SensorUpdate(BaseModel): 
  name : str | None = None
  sensor_type : SensorType | None = None
  unit : Units | None = None
  status : SensorStatus | None = None
  min_warning : float | None = None
  max_warning : float | None = None
  min_critical : float | None = None
  max_critical : float | None = None
  location_id : str | None = None
  asset_id : str | None = None

class SensorAsset(BaseModel):
  id : str
  name : str
  status : SensorStatus = SensorStatus.ACTIVE

  model_config = ConfigDict(from_attributes=True)