const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const formatMessages = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeaves,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const PORT = 3001 || process.env.PORT;
const server = http.createServer(app);
const io = socketIO(server);
const botName = "Admin";
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessages(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessages(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //get chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessages(user.username, msg));
  });

  //when user leave
  socket.on("disconnect", () => {
    const user = userLeaves(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessages(botName, `${user.username} has left the chat!`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
