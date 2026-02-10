from sqlalchemy import text
from app.database import engine

def init_timescale():
    try:
      with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
        connection.execute(text("SELECT create_hypertable('sensor_data', 'time', if_not_exists => TRUE, migrate_data => TRUE);"))        
    except Exception as e:
        print(f"{e}")