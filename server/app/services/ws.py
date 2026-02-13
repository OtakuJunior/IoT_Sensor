from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"number of connections : {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        print(f"data : {data}")
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"erreur {e}")
                self.disconnect(connection)

manager = ConnectionManager()
