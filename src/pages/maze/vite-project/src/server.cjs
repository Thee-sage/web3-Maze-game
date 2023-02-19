const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the IndexPage as the root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/IndexPage.js");
});

// Listen for incoming connections
io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected`);

  // When a client submits a winner name, broadcast it to all connected sockets
  socket.on("winner", (name) => {
    console.log(`Winner submitted: ${name}`);
    io.emit("winner", name);
  });

  // When a client connects, send them the prize door
  socket.emit("prizeDoor", Math.floor(Math.random() * 30) + 1);

  // Handle disconnection events
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Start the server
const port = process.env.PORT || 5174;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
