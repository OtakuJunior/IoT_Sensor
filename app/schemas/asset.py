from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Base asset model
class AssetBase(BaseModel):
  qr_id : int 
  name : str
  category : str 
  last_maintenance : datetime
  location_id : int

# Model to create an asset
class AssetCreate(AssetBase):
  pass

# Model to read an asset
class Asset(AssetBase):
  id : int
  model_config = ConfigDict(from_attributes=True)