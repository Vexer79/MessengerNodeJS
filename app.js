require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const bodyParser = require("body-parser");
const path = require("path");

const { Server } = require("socket.io");
const io = new Server(server);

const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const dbName = process.env.dbName;
const User = require("./models/user");
const isAuth = require("./middleware/is-auth");
const flash = require("connect-flash");
const userStore = new Set();

const store = new MongoDBStore({
    uri: process.env.MONGO_DB_URL,
    collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use(authRoutes);

app.get("/", isAuth, (req, res, next) => {
    res.render("index", {
        path: "/",
        pageTitle: "Main",
        username: req.session.user.username,
    });
});

io.on("connection", (socket) => {
    let user = {};

    socket.on("chat message", (msg) => {
        console.log(msg);
        io.emit(msg.to, msg);
        io.emit("notifications", msg);
    });

    socket.on("new user connected", (msg) => {
        user.username = msg;
        userStore.add(JSON.stringify(user));
        const onlineUsers = JSON.stringify(Array.from(userStore));
        socket.broadcast.emit("new user connection", onlineUsers);
        socket.emit("new user connection", onlineUsers);
    });

    socket.on("disconnect", (msg) => {
        userStore.delete(JSON.stringify(user));
        const onlineUsers = JSON.stringify(Array.from(userStore));
        socket.broadcast.emit("new user connection", onlineUsers);
        socket.emit("new user connection", onlineUsers);
    });
});

mongoose
    .connect(process.env.MONGO_DB_URL, { dbName })
    .then(() => {
        server.listen(process.env.PORT, process.env.IP_ADRESS);
    })
    .catch((err) => {
        console.log(err);
    });
