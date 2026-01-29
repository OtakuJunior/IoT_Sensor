from sqlalchemy import Column, DateTime, Float, ForeignKey, String
from app.database import Base
from sqlalchemy.orm import relationship
import uuid


class SensorData(Base):
  __tablename__ = "sensor_data"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  sensor_id = Column(String, ForeignKey("sensors.id")) 
  value = Column(Float, nullable=False)
  time = Column(DateTime(timezone=True))
  
  sensor = relationship("Sensor", back_populates="data")