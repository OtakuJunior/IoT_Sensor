def test_check_value(test_client, sensor_data_payload, location_payload, sensor_payload, db_session):
  from app.models.alert import Alert as Alert_Model
  from app.models.sensor_data import SensorData as Sensor_data_Model

  # We don't use location_sensor_constraint function because we need an instance of sensor
  location_created = test_client.post("/locations", json=location_payload)
  location_id = location_created.json()['id']
  sensor_payload['location_id'] =  location_id
  sensor_created = test_client.post("/sensors", json=sensor_payload)
  sensor_id = sensor_created.json()["id"]  
  sensor_data_payload['sensor_id'] = sensor_id

  data1 = test_client.post("/sensor_data", json=sensor_data_payload) # Value = 40
  assert data1.status_code == 201

  sensor_data_payload['time'] = "2026-01-15T16:00:01"
  data2 = test_client.post("/sensor_data", json=sensor_data_payload) 
  assert data2.status_code == 201

  sensor_data_payload["value"] = 60.0
  sensor_data_payload['time'] = "2026-01-15T16:00:02"
  data3 = test_client.post("/sensor_data", json=sensor_data_payload) 
  assert data3.status_code == 201

  sensor_data_payload['time'] = "2026-01-15T16:00:03"
  data4 = test_client.post("/sensor_data", json=sensor_data_payload) 
  assert data4.status_code == 201

  db_alert = db_session.query(Alert_Model).filter(Alert_Model.sensor_id == sensor_id).all()
  assert db_alert is not None 
  assert len(db_alert) == 2
  assert db_alert[0].severity == "Warning"
  assert db_alert[1].severity == "Critical"

def test_check_value_without_threshold(test_client, location_payload, sensor_payload, sensor_data_payload, db_session):
  from app.models.alert import Alert as Alert_Model

  location_created = test_client.post("/locations", json=location_payload)
  location_id = location_created.json()['id']
  sensor_payload['location_id'] =  location_id
  sensor_payload["min_warning"] = None
  sensor_payload["max_warning"] = None
  sensor_payload["min_critical"] = None
  sensor_payload["max_critical"] = None
  sensor_created = test_client.post("/sensors", json=sensor_payload)
  sensor_id = sensor_created.json()["id"]  
  sensor_data_payload['sensor_id'] = sensor_id

  data1 = test_client.post("/sensor_data", json=sensor_data_payload) # Value = 40
  assert data1.status_code == 201

  sensor_data_payload["value"] = -15.0
  data2 = test_client.post("/sensor_data", json=sensor_data_payload)
  assert data2.status_code == 201

  sensor_data_payload["value"] = -35.0
  data3 = test_client.post("/sensor_data", json=sensor_data_payload)
  assert data3.status_code == 201

  sensor_data_payload["value"] = 60.0
  data4 = test_client.post("/sensor_data", json=sensor_data_payload)
  assert data4.status_code == 201

  db_alert = db_session.query(Alert_Model).filter(Alert_Model.sensor_id == sensor_id).all()
  assert len(db_alert) == 0

def test_one_alert_for_critical_value(test_client, sensor_data_payload, location_payload, sensor_payload, db_session):
  from app.models.alert import Alert as Alert_Model

  location_created = test_client.post("/locations", json=location_payload)
  location_id = location_created.json()['id']
  sensor_payload['location_id'] =  location_id
  sensor_created = test_client.post("/sensors", json=sensor_payload)
  sensor_id = sensor_created.json()["id"]  
  sensor_data_payload['sensor_id'] = sensor_id
  sensor_data_payload["value"] = -35.0
  data = test_client.post("/sensor_data", json=sensor_data_payload)
  assert data.status_code == 201
  db_alert = db_session.query(Alert_Model).filter(Alert_Model.sensor_id == sensor_id).all()
  assert len(db_alert) == 1
  alert_created = db_alert[0]
  assert alert_created.direction == "Low"
  assert alert_created.is_resolved == False
  assert alert_created.severity == 'Critical'

