require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
    socket.broadcast.emit("chat message", "New User Connected!");
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });
});

server.listen(process.env.PORT, process.env.IP_ADRESS, () => {
    console.log("listening on *:3000");
});
