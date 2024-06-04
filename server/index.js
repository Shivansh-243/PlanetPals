const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

// connectDB();

app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, you can specify specific origins here
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
const users = new Map();

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("let's chat", (data) => {
    console.log("lets chat ", data);
    socket.emit("chat request", data);
  });
  socket.on("sendMessage", (data) => {
    console.log("sendmsg ", data);
    socket.emit("message", data);
  });
  socket.on("online", (data) => {
    console.log("online ", data);
    users.set(data.user.id, {
      lat: data.lat,
      long: data.long,
      username: data.user.username,
      id: data.user.id,
    });
    socket.broadcast.emit("online", data);
    socket.emit("previousUsers", Array.from(users.values()));
  });
  socket.on("acceptRequest", (data) => {
    console.log("acceptRequest ", data);
    // return;
    const roomName = data.senderId.toString() + data.receiverId.toString();
    socket.join(roomName);
    socket.emit("roomJoin", {
      position: data.position,
      room: roomName,
      senderId: data.senderId,
      receiverId: data.receiverId,
    });
  });
  socket.on("joinRoom", (data) => {
    console.log("room join", data);
    socket.join(data.room);
    socket.emit("openChat", data);
  });
  socket.on("cancelChat", (data) => {
    socket.to(data.room).emit("exitChat");
  });
  socket.on("cancelRequest", (data) => {
    console.log("reject Request ", data);
    socket.emit("requestRejected", data);
  });
});

server.listen(5001, () => {
  console.log("socket server is listenig on the 5001");
});
app.listen(5000, () => {
  console.log("server is listening on 5000");
});
