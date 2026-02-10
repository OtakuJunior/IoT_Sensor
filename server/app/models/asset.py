from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from app.database import Base
from sqlalchemy.orm import relationship
import uuid
from app.services.enums import AssetStatus


class Asset(Base):
  __tablename__ = "assets"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  qr_id = Column(String, nullable=False, default=lambda: str(uuid.uuid4())[:8])
  name = Column(String)
  status = Column(Enum(AssetStatus))
  last_maintenance = Column(DateTime(timezone=True), nullable=False)
  location_id = Column(String, ForeignKey("locations.id")) 

  asset_location = relationship("Location", back_populates="assets")
  sensors_asset = relationship("Sensor", back_populates="asset")
