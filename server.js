const express = require("express");
const http = require("http");
const webSocket = require("ws");

const app = express();
const server = http.createServer(app);
const ws = new webSocket.Server({ server });

ws.on("connection", (socket) => {
  socket.on("message", (m) => { 
    const { action, data } = JSON.parse(m);
    console.log(action, data);
    if (action == "draw") {
      ws.clients.forEach((client) => {
        if (client.readyState === webSocket.OPEN) {
          client.send(JSON.stringify({ action, data }));
        }
      });
    } else if (action == "remove") {
      ws.clients.forEach((client) => {
        if (client.readyState === webSocket.OPEN) {
          client.send(JSON.stringify({ action, data }));
        }
      });
    } else if (action == "chat") {
      ws.clients.forEach((client) => {
        if (client.readyState === webSocket.OPEN) {
          client.send(JSON.stringify({ action, data }));
        }
      });
    }
  });
});

server.listen(8080, () => {
  console.log("Serveur listening on 8080");
});
