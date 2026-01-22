from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Sensor(Base):
  __tablename__ = "sensors"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String, nullable=False)
  type = Column(String, nullable=False)
  unit = Column(String, nullable=False)
  min_warning = Column(Float)
  max_warning = Column(Float)
  min_critical = Column(Float)
  max_critical = Column(Float)
  location_id = Column(Integer, ForeignKey("locations.id"))

  alerts = relationship("Alert", back_populates="message_sensor")
  sensor_location = relationship("Location", back_populates="sensors")
  data = relationship("SensorData", back_populates="sensor")
