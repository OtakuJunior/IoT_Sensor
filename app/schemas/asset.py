from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.sensor import SensorAsset
from app.services.enums import AssetStatus

# Base asset model
class AssetBase(BaseModel):
  name : str
  status : AssetStatus = AssetStatus.OPERATIONAL
  last_maintenance : datetime | None = None
  location_id : str


# Model to create an asset
class AssetCreate(AssetBase):
  pass

# Model to read an asset
class Asset(AssetBase):
  id : str
  qr_id : str
  status : AssetStatus
  
  #return a list of sensor from this asset
  sensors_asset: list[SensorAsset] = []

  model_config = ConfigDict(from_attributes=True)
