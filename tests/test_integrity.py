import pytest
from sqlalchemy.exc import IntegrityError

def test_sensor_location_integrity(test_client, sensor_payload):
  false_location_id = -1
  sensor_payload["location_id"] = false_location_id
  
  #We expect an IntegrityError
  with pytest.raises(IntegrityError):
    test_client.post("/sensors", json=sensor_payload)

def test_asset_location_integrity(test_client, asset_payload):
  false_location_id = -1
  asset_payload["location_id"] = false_location_id

  with pytest.raises(IntegrityError):
    test_client.post("/assets", json=asset_payload)

def test_sensor_sensordata_integrity(test_client, sensor_data_payload):
  false_sensor_id = -1
  sensor_data_payload['sensor_id'] = false_sensor_id

  with pytest.raises(IntegrityError):
    test_client.post("/sensor_data", json=sensor_data_payload)

def test_sensor_alert_integrity(test_client, alert_payload):
  false_sensor_id = -1
  alert_payload['sensor_id'] = false_sensor_id

  with pytest.raises(IntegrityError):
    test_client.post("/alerts", json=alert_payload)