def test_user_not_found(test_client):
  response = test_client.get("/users/9999")
  assert response.status_code == 404

def test_delete_user(test_client, user_payload):
  user_response = test_client.post("/users", json=user_payload)
  assert user_response.status_code == 201
  user_id = user_response.json()["id"]
  user_delete = test_client.delete(f"/users/{user_id}")
  assert user_delete.status_code == 204
  delete_check = test_client.get(f"/users/{user_id}")
  assert delete_check.status_code == 404

def test_update_alert(test_client, alert_payload, location_sensor_constraint):
  sensor_id = location_sensor_constraint()
  alert_payload["sensor_id"] = sensor_id
  alert_response = test_client.post("/alerts", json=alert_payload)
  alert_id = alert_response.json()['id']
  assert alert_response.status_code == 201
  assert alert_response.json()["is_resolved"] == False
  updated_alert = test_client.patch(f"/alerts/{alert_id}/resolve", json={"is_resolved" : True})
  assert updated_alert.json()["is_resolved"] == True

def test_update_sensor(test_client, sensor_payload, location_payload):
  location_created = test_client.post("/locations", json=location_payload)
  location_id = location_created.json()['id']
  sensor_payload['location_id'] =  location_id
  sensor_response = test_client.post("/sensors", json=sensor_payload)
  sensor_id = sensor_response.json()["id"]
  updated_sensor = test_client.patch(f"/sensors/{sensor_id}", json={
    "min_warning" : -15.0,
    "max_warning" : 42.0,
    "min_critical" :  -25.0, 
    "max_critical" : 55.0
  })
  assert updated_sensor.json()['min_warning'] == -15.0
  assert updated_sensor.json()['max_warning'] == 42.0
  assert updated_sensor.json()['min_critical'] == -25.0
  assert updated_sensor.json()['max_critical'] == 55.0
