import enum

class SensorStatus(str, enum.Enum):
  ACTIVE = 'Active'
  INACTIVE = 'Inactive'
  BYPASS = 'Bypass'
  DEREGISTERED = 'Deregisted'
  ERROR = 'Error'

class AssetStatus(str, enum.Enum): 
  OPERATIONAL = 'Operational'
  MAINTENANCE = 'Maintenance'
  STOPPED = 'Stopped'
  LOST = 'Lost'
  BROKEN = 'Broken'
  ARCHIVED ='Archived'

class SensorType(str, enum.Enum):
  TEMPERATURE = 'Temperature'
  PRESSION = 'Pression'
  HUMIDITY = 'Humidity'
  GAZ = 'Gaz'
  SMOKE = 'Smoke'

class Units(str, enum.Enum):
  CELSIUS = '°C'
  PERCENTAGE = '%'
  HECTOPASCAL = 'hPa'
  PARTS_PER_MILLION = 'ppm'







