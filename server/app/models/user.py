from sqlalchemy import Column, String, Enum
from app.database import Base
import uuid
from app.services.enums import UserRole


class User(Base):
  __tablename__ = "Users"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  name = Column(String, nullable=False)
  email = Column(String, nullable=False, unique=True)
  phone_number = Column(String, nullable=False, unique=True)
  role = Column(Enum(UserRole), nullable=False)
  keycloak_id = Column(String)
