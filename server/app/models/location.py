from sqlalchemy import Column, String
from app.database import Base
from sqlalchemy.orm import relationship
import uuid


class Location(Base):
  __tablename__ = "locations"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  name = Column(String, nullable=False)

  assets = relationship("Asset", back_populates="asset_location")
  sensors = relationship("Sensor", back_populates="sensor_location")