from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
URL_DATABASE = os.getenv('URL_DATABASE')

engine = create_engine(URL_DATABASE)
sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
  db = sessionLocal()
  try:
    yield db
  finally:
    db.close()
