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
        io.emit("notifications", msg);
    });

    socket.on("call-user", (data) => {
        socket.to(data.to).emit("call-made", {
            offer: data.offer,
            socket: socket.id,
        });
    });
    
    socket.on("make-answer", (data) => {
        socket.to(data.to).emit("answer-made", {
            socket: socket.id,
            answer: data.answer,
        });
    });
});

server.listen(process.env.PORT, process.env.IP_ADRESS, () => {
    console.log("listening on *:3000");
});
