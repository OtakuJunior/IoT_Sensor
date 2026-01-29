from sqlalchemy import Column, String, Float, ForeignKey, Enum
from app.database import Base
from sqlalchemy.orm import relationship
import uuid
from app.services.enums import SensorStatus, SensorType, Units


class Sensor(Base):
  __tablename__ = "sensors"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  name = Column(String, nullable=False)
  sensor_type = Column(Enum(SensorType), nullable=False)
  unit = Column(Enum(Units), nullable=False)
  status = Column(Enum(SensorStatus), nullable=False)
  min_warning = Column(Float)
  max_warning = Column(Float)
  min_critical = Column(Float)
  max_critical = Column(Float)
  location_id = Column(String, ForeignKey("locations.id"))
  asset_id = Column(String, ForeignKey("assets.id"))

  alerts = relationship("Alert", back_populates="message_sensor")
  sensor_location = relationship("Location", back_populates="sensors")
  data = relationship("SensorData", back_populates="sensor")
  asset = relationship("Asset", back_populates='sensors_asset')
