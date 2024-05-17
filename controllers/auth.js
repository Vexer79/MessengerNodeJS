const bcrypt = require("bcryptjs");
const path = require("path");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("login", {
        path: "/login",
        pageTitle: "Login",
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("signup", {
        path: "/signup",
        pageTitle: "Signup",
    });
};

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ username: username })
        .then((user) => {
            if (!user) {
                req.flash("error", "Invalid username or password.");
                return res.render("signup", {
                    path: "/signup",
                    pageTitle: "Signup",
                });
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect("/");
                        });
                    }
                    console.log("error");
                    req.flash("error", "Invalid username or password.");
                    res.render("login", {
                        path: "/login",
                        pageTitle: "Login",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/login");
                });
        })
        .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ username: username })
        .then((userDoc) => {
            if (userDoc) {
                req.flash("error", "E-Mail exists already, please pick a different one.");
                return res.redirect("/login");
            }
            return bcrypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    const user = new User({
                        username: username,
                        password: hashedPassword,
                    });
                    return user.save();
                })
                .then((user) => {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect("/");
                    });
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};
