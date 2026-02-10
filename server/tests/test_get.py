def test_get_user(test_client, user_payload):
  user_created = test_client.post("/users", json=user_payload)
  assert user_created.status_code == 201
  user_id = user_created.json()["id"]
  user_response = test_client.get(f"/users/{user_id}")
  assert user_response.status_code == 200
  assert user_response.json()['id'] == user_id
  assert user_response.json()["name"] == user_payload["name"]
  assert user_response.json()["email"] == user_payload["email"]
  assert user_response.json()["role"] == user_payload["role"]

def test_get_asset(test_client, asset_payload, location_payload):
  location_created = test_client.post("/locations", json=location_payload)
  location_id = location_created.json()['id']
  asset_payload["location_id"] = location_id
  asset_created = test_client.post("/assets", json=asset_payload)
  assert asset_created.status_code == 201
  asset_id = asset_created.json()["id"]
  asset_response = test_client.get(f"/assets/{asset_id}")
  assert asset_response.status_code == 200
  assert asset_response.json()['id'] == asset_id
  assert asset_response.json()["qr_id"] is not None
  assert asset_response.json()['name'] == asset_payload["name"]
  assert asset_response.json()['last_maintenance'] == asset_payload["last_maintenance"]

def test_get_location(test_client, location_payload):
  location_created = test_client.post("/locations", json=location_payload)
  assert location_created.status_code == 201
  location_id = location_created.json()["id"]
  loaction_response = test_client.get(f"/locations/{location_id}")
  assert loaction_response.status_code == 200
  assert loaction_response.json()["id"] == location_id 
  assert loaction_response.json()["name"] == location_payload["name"]

def test_get_alert(test_client, alert_payload, location_sensor_constraint):
  sensor_id = location_sensor_constraint()
  alert_payload['sensor_id'] = sensor_id
  alert_created = test_client.post("/alerts", json=alert_payload)
  assert alert_created.status_code == 201
  alert_id = alert_created.json()["id"]
  alert_response = test_client.get(f"/alerts/{alert_id}")
  assert alert_response.status_code == 200
  assert alert_response.json()["id"] == alert_id 
  assert alert_response.json()["severity"] == alert_payload["severity"]
  assert alert_response.json()["is_resolved"] == alert_payload["is_resolved"]

def test_get_sensor(test_client, sensor_payload, location_payload):

  location_created = test_client.post("/locations", json=location_payload)
  location_id = location_created.json()['id']
  sensor_payload['location_id'] = location_id

  sensor_created = test_client.post("/sensors", json=sensor_payload)
  assert sensor_created.status_code == 201
  sensor_id = sensor_created.json()["id"]
  sensor_response = test_client.get(f"/sensors/{sensor_id}")
  assert sensor_response.status_code == 200
  assert sensor_response.json()["id"] == sensor_id 
  assert sensor_response.json()["name"] == sensor_payload["name"]
  assert sensor_response.json()["min_warning"] == sensor_payload["min_warning"]
  assert sensor_response.json()["max_warning"] == sensor_payload["max_warning"]
  assert sensor_response.json()["min_critical"] == sensor_payload["min_critical"]
  assert sensor_response.json()["max_critical"] == sensor_payload["max_critical"]
  assert sensor_response.json()["location_id"] == sensor_payload["location_id"]

def test_get_sensor_data(test_client, sensor_data_payload, location_sensor_constraint):
  sensor_id = location_sensor_constraint()
  sensor_data_payload['sensor_id'] = sensor_id
  sensor_data_created = test_client.post("/sensor_data", json=sensor_data_payload)
  assert sensor_data_created.status_code == 201 
  sensor_data_id = sensor_data_created.json()["id"]
  sensor_data_response = test_client.get(f"/sensor_data/{sensor_data_id}")
  assert sensor_data_response.status_code == 200
  assert sensor_data_response.json()["id"] == sensor_data_id 
  assert sensor_data_response.json()["sensor_id"] == sensor_data_payload["sensor_id"]
  assert sensor_data_response.json()["value"] == sensor_data_payload["value"]
  assert sensor_data_response.json()["time"] == sensor_data_payload["time"]

def test_get_sensor_data_history(test_client, sensor_data_payload, location_sensor_constraint):
  sensor_id = location_sensor_constraint()
  sensor_data_payload['sensor_id'] = sensor_id
  sensor_data1 = test_client.post("/sensor_data", json=sensor_data_payload)
  sensor_data_payload["time"] = "2026-01-15T16:00:01"
  sensor_data2 = test_client.post("/sensor_data", json=sensor_data_payload)
  sensor_data_payload["time"] = "2026-01-15T16:00:02"
  sensor_data3 = test_client.post("/sensor_data", json=sensor_data_payload)

  history_data = test_client.get(f"/sensor_data/{sensor_id}/history")
  assert history_data.status_code == 200
  assert isinstance(history_data.json(), list)
  assert len(history_data.json()) == 3
  

  