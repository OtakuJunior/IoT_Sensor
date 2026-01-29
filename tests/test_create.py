def test_create_user(test_client, user_payload):
  response = test_client.post("/users", json=user_payload)
  assert response.status_code == 201
  assert response.json()["name"] == user_payload["name"]
  assert response.json()["email"] == user_payload["email"]
  assert response.json()["role"] == user_payload["role"]

def test_create_location(test_client, location_payload):
  response = test_client.post("/locations", json=location_payload)
  assert response.status_code == 201
  assert response.json()["name"] == location_payload["name"]

def test_create_sensor(test_client, location_payload, sensor_payload):

  location_response = test_client.post("/locations", json=location_payload)
  assert location_response.status_code == 201
  location_id = location_response.json()["id"]
  sensor_payload['location_id'] = location_id
  response = test_client.post("/sensors", json=sensor_payload)

  response_json = response.json()
  assert response.status_code == 201
  assert response_json["name"] == sensor_payload["name"]
  assert response_json["sensor_type"] == sensor_payload["sensor_type"]
  assert response_json["unit"] == sensor_payload["unit"]
  assert isinstance(response_json["min_warning"], float)
  assert isinstance(response_json["max_warning"], float)
  assert isinstance(response_json["min_critical"], float)
  assert isinstance(response_json["max_critical"], float)
  assert response_json["min_critical"] == sensor_payload["min_critical"]
  assert response_json["max_warning"] == sensor_payload["max_warning"]

def test_create_sensor_data(test_client, sensor_payload, sensor_data_payload, location_payload):

  location_response = test_client.post("/locations", json=location_payload)
  assert location_response.status_code == 201
  location_id = location_response.json()["id"]
  sensor_payload['location_id'] = location_id
  sensor_response = test_client.post("/sensors", json=sensor_payload)
  assert sensor_response.status_code == 201
  sensor_id = sensor_response.json()["id"]
  sensor_data_payload["sensor_id"] = sensor_id

  response = test_client.post("/sensor_data", json=sensor_data_payload)
  response_json = response.json()
  assert response.status_code == 201
  assert response_json["value"] == sensor_data_payload["value"]
  assert response_json["time"] == sensor_data_payload["time"]

def test_create_alert(test_client, alert_payload, location_payload, sensor_payload):

  location_response = test_client.post("/locations", json=location_payload)
  assert location_response.status_code == 201
  location_id = location_response.json()["id"]
  sensor_payload['location_id'] = location_id
  sensor_response = test_client.post("/sensors", json=sensor_payload)
  sensor_id = sensor_response.json()['id']
  alert_payload["sensor_id"] = sensor_id

  response = test_client.post("/alerts", json=alert_payload)
  assert response.status_code == 201
  assert response.json()["severity"] == alert_payload["severity"]
  assert response.json()["message"] == alert_payload["message"]
  assert response.json()["is_resolved"] == alert_payload["is_resolved"]
  assert response.json()["time"] == alert_payload["time"]

def test_create_asset(test_client, sensor_payload, location_payload, asset_payload):

  location_response = test_client.post("/locations", json=location_payload)
  assert location_response.status_code == 201
  location_id = location_response.json()["id"]
  sensor_payload['location_id'] = location_id
  sensor_response = test_client.post("/sensors", json=sensor_payload)
  sensor_id = sensor_response.json()['id']
  asset_payload["sensor_id"] = sensor_id
  asset_payload['location_id'] = location_id

  response = test_client.post("/assets", json=asset_payload)
  assert response.status_code == 201
  assert response.json()["name"] == asset_payload["name"]
  assert response.json()["last_maintenance"] == asset_payload["last_maintenance"]
  assert response.json()["qr_id"] is not None
