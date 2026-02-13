/** @type {WebSocket} */

let socket = null;
export const initSocket = (onMessage) => {
  console.log("Websocket connection...");
  // Check if socket already exists or is connecting
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  socket = new WebSocket("ws://localhost:8000/ws");
  socket.addEventListener("open", () => {
    console.log("CONNECTED");
  });

  socket.addEventListener("error", (err) => {
    console.log(err);
  });

  const messageReceived = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch (err) {
      console.error(err);
    }
  };
  socket.addEventListener("message", messageReceived);

  socket.addEventListener("close", () => {
    console.log("DISCONNECTED");
    socket.removeEventListener("message", messageReceived);
    setTimeout(() => initSocket(onMessage), 5000);
  });
};
