import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if engine.dialect.name == "sqlite":
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

Base.metadata.create_all(bind=engine)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture()
def user_payload():
    return {
      "name" : "John",
      "email" : "john.smith@gmail.com",
      "phone_number" : "0000000000",
      "role" : "admin"
    }

@pytest.fixture()
def asset_payload(location_payload):
    return {
        "qr_id" : 12345,
        "name" : "asset1",
        "category" : "HVAC",
        "last_maintenance" : "2026-01-15T16:00:00",
        "location_id" : location_payload["id"]
    }

@pytest.fixture()
def location_payload():
    return {
        "id" : 1,
        "name" : "Lab1"
    }
    
@pytest.fixture()
def sensor_payload(location_payload):
    return {
      "id" : 2,
      "name" : "Lab1 temperature sensor",
      "type" : "Temperature",
      "unit" : "Celsius", 
      "min_warning" : -10.0,
      "max_warning" : 40.0,
      "min_critical" : -20.0,
      "max_critical" : 50.0,
      "location_id" : location_payload["id"]
    }

@pytest.fixture()
def sensor_data_payload():
    return {
        "value" : 40.0,
        "time" : "2026-01-15T16:00:00"
    }

@pytest.fixture()
def alert_payload(sensor_payload):
    return {
        "severity" : "Warning",
        "message" : "high temperature detected in lab1",
        "time" : "2026-01-15T16:00:00",
        "is_resolved" : False,
        "sensor_id" : sensor_payload["id"]
    }

@pytest.fixture()
def location_sensor_constraint(test_client, location_payload, sensor_payload):
    def make_location_sensor_constraint():
        location_created = test_client.post("/locations", json=location_payload)
        location_id = location_created.json()['id']
        sensor_payload['location_id'] =  location_id
        sensor_created = test_client.post("/sensors", json=sensor_payload)
        sensor_id = sensor_created.json()["id"]
        return sensor_id
    return make_location_sensor_constraint