from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship
import uuid

class Alert(Base):
  __tablename__ = "alerts"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  severity = Column(String, nullable=False)
  direction = Column(String, nullable=False)
  message = Column(String)
  time = Column(DateTime(timezone=True))
  is_resolved = Column(Boolean, nullable=False, default=False)
  sensor_id = Column(String, ForeignKey("sensors.id"))

  message_sensor = relationship("Sensor", back_populates="alerts")