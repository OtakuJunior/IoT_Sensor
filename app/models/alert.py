from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Alert(Base):
  __tablename__ = "alerts"

  id = Column(Integer, primary_key=True, index=True)
  severity = Column(String, nullable=False)
  message = Column(String)
  time = Column(DateTime(timezone=True))
  is_resolved = Column(Boolean, nullable=False, default=False)
  sensor_id = Column(Integer, ForeignKey("sensors.id"))

  message_sensor = relationship("Sensor", back_populates="alerts")