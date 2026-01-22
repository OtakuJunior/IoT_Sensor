from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship

class Location(Base):
  __tablename__ = "locations"

  id = Column(Integer, primary_key=True, index = True)
  name = Column(String, nullable=False)

  assets = relationship("Asset", back_populates="asset_location")
  sensors = relationship("Sensor", back_populates="sensor_location")