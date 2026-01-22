from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
  __tablename__ = "Users"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String, nullable=False)
  email = Column(String, nullable=False)
  phone_number = Column(String)
  role = Column(String)
