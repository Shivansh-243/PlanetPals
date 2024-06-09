const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    console.log("user disconnected", users.get(socket.id));
    socket.broadcast.emit("offline", users.get(socket.id));
    users.delete(socket.id);
  });

  socket.on("let's chat", (data) => {
    console.log("lets chat ", data);
    socket.broadcast.emit("chatRequest", data);
  });
  socket.on("sendMessage", async (data) => {
    console.log("sendmsg ", data);
    socket.to(data.room).emit("message", data);
    try {
      const senderId = parseInt(data.room[0]);
      const receiverId = parseInt(data.room[1]);
      const newMessage = await prisma.message.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          content: data.msg,
        },
      });
      console.log("new message ", newMessage);
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("online", (data) => {
    if (users.has(socket.id)) {
      return;
    }
    console.log("online ", data);
    socket.broadcast.emit("online", data);
    socket.emit("previousUsers", Array.from(users.values()));
    users.set(socket.id, {
      lat: data.lat,
      long: data.long,
      username: data.user.username,
      id: data.user.id,
    });
  });
  socket.on("acceptRequest", (data) => {
    console.log("acceptRequest ", data);
    // return;
    const roomName = data.senderId.toString() + data.receiverId.toString();
    socket.join(roomName);
    socket.broadcast.emit("roomJoin", {
      position: data.position,
      room: roomName,
      senderId: data.senderId,
      receiverId: data.receiverId,
    });
  });
  socket.on("joinRoom", async (data) => {
    console.log("room join", data);
    socket.join(data.room);
    const sockets = await io.in(data.room).fetchSockets();
    console.log("sockets");
    for (const _socket of sockets) {
      console.log(_socket.id);
      // console.log(socket.handshake);
      // console.log(socket.rooms);
      // console.log(socket.data);
    }

    io.to(data.room).emit("openChat", data);
  });
  socket.on("cancelChat", (data) => {
    socket.to(data.room).emit("exitChat");
  });
  socket.on("cancelRequest", (data) => {
    console.log("reject Request ", data);
    io.emit("requestRejected", data);
  });
});

server.listen(5001, () => {
  console.log("socket server is listenig on the 5001");
});
app.listen(5000, () => {
  console.log("server is listening on 5000");
});
