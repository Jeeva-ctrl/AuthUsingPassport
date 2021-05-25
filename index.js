/*  EXPRESS SETUP  */

const bodyParser = require("body-parser");
const express = require("express");
const app = express();

app.use(express.static(__dirname));

const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("App listening on port" + port));

//Passport srt up

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

//Mongoose set up

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/MyDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserDetail = new mongoose.Schema({
  username: String,
  password: String,
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model("userInfo", UserDetail, "userInfo");

//passport local authentication

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());

passport.deserializeUser(UserDetails.deserializeUser());

const connectEnsureLogin = require("connect-ensure-login");

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("info", info);
    console.log("user", user);
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(`/login?info=` + info);
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

app.get("/login", (req, res) =>
  res.sendFile("html/login.html", { root: __dirname })
);

app.get("/", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
  res.sendFile("html/index.html", { root: __dirname })
);

app.get("/private", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
  res.sendFile("html/private.html", { root: __dirname })
);
app.get("/user", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
  res.send({ user: req.user })
);
