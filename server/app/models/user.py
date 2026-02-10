from sqlalchemy import Column, String
from app.database import Base
import uuid


class User(Base):
  __tablename__ = "Users"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  name = Column(String, nullable=False)
  email = Column(String, nullable=False)
  phone_number = Column(String)
  role = Column(String)
