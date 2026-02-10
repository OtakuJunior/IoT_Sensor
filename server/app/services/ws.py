from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, sensor_id : str):
        await websocket.accept()
        if sensor_id not in self.active_connections:
            self.active_connections[sensor_id] = []
        self.active_connections[sensor_id].append(websocket)
        print(f"number of connections : {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, sensor_id : str):
        if sensor_id in self.active_connections:
            self.active_connections[sensor_id].remove(websocket)
            if not self.active_connections[sensor_id]:
                del self.active_connections[sensor_id]

    async def broadcast(self, data: dict, sensor_id : str):
        if sensor_id in self.active_connections:
            for connection in self.active_connections[sensor_id]:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    self.disconnect(connection, sensor_id=sensor_id)

manager = ConnectionManager()
