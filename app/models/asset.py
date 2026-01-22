from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Asset(Base):
  __tablename__ = "assets"

  id = Column(Integer, primary_key=True, index=True)
  qr_id = Column(Integer, nullable=False)
  name = Column(String)
  category = Column(String)
  last_maintenance = Column(DateTime(timezone=True), nullable=False)
  location_id = Column(Integer, ForeignKey("locations.id")) 

  asset_location = relationship("Location", back_populates="assets")
