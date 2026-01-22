from sqlalchemy import Column, Integer, DateTime, Float, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class SensorData(Base):
  __tablename__ = "sensor_data"

  id = Column(Integer, primary_key=True, index=True)
  sensor_id = Column(Integer, ForeignKey("sensors.id")) 
  value = Column(Float, nullable=False)
  time = Column(DateTime(timezone=True))
  
  sensor = relationship("Sensor", back_populates="data")