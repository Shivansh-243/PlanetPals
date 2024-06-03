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

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
  socket.on("sendMessage", (data) => {
    console.log(data.msg);
    socket.emit("chat message", data.msg);
  });
});

server.listen(5001, () => {
  console.log("socket server is listenig on the 5001");
});
app.listen(5000, () => {
  console.log("server is listening on 5000");
});
