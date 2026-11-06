const express = require("express");
require("dotenv").config();
const argon2 = require("argon2");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");

const Food = require("./models/Food");
const User = require("./models/User");

const app = express();

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/sjappa");
mongoose.connect(process.env.MONGODB_URI);

app.get("/", async (req, res) => {
  const food = await Food.find();
  console.log(food);

  res.render("index", { food });
});

app.get("/register-food", async (req, res) => {
  console.log(req.cookies);

  const token = req.cookies.jwt;

  const cookie = jwt.verify(token, process.env.SECRET_JWT);
  console.log(cookie);
  let userId = cookie.userId;
  const user = await User.findById(userId);
  console.log(user);
  if (user.role !== "admin") {
    res.redirect("/");
  } else {
    res.render("registerFood");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register-user", (req, res) => {
  res.render("registerUser");
});

app.get("/reset-password", (req, res) => {
  res.render("resetPassword");
});

app.get("/forgot-password", (req, res) => {
  res.render("forgottenPassword");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  console.log(user);
  if (user) {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "roman.robel31@ethereal.email",
        pass: "AGj2PsaWbvpN7xuMUd",
      },
    });

    const jwtEmail = jwt.sign({email: user.email}, process.env.SECRET_JWT);

    await transporter.sendMail({
        from: "roman.robel31@ethereal.email",
        to: "roman.robel31@ethereal.email", //byttes ut med user.email
        subject: "Glemt passord",
        // text: "Her er din nye reset passord lenke"
        html: `<p>Her er din nye reset passord lenke</p>
        <a href="http://localhost:4000/reset-password?email=${jwtEmail}">Trykk her</a>`

    })

    
    //send reset lenke
  }
});
app.post("/reset-password", async (req, res) => {
  const { password, repeatPassword } = req.body;

  const url = req.query;
  console.log("req.query", url);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    res.status(404).send("email eller passord stemmer ikke overens");
  }

  let isPassword = await argon2.verify(user.password, password);
  console.log(isPassword);
  if (isPassword) {
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_JWT);
    console.log("token", token);

    res.cookie("jwt", token);

    if (user.role === "admin") {
      res.redirect("/register-food");
    } else {
      res.redirect("/profile");
    }
  } else {
    res.send("email eller passord stemmer ikke overens");
  }
});

app.post("/register-user", async (req, res) => {
  const { email, password, repeatPassword } = req.body;

  if (password === repeatPassword) {
    const hash = await argon2.hash(password);

    const user = new User({ email, password: hash });

    await user.save();
    res.status(201).redirect("/login");
  } else {
    res.send("passord stemmer ikke overens");
  }
});

app.post("/register-food", async (req, res) => {
  const { bildeurl, tittel, beskrivelse, ingredienser, kategori, pris } =
    req.body;
  console.log(req.body);

  const food = new Food({
    bildeurl,
    tittel,
    beskrivelse,
    ingredienser,
    kategori,
    pris,
  });

  await food.save();
  res.status(200).redirect("/register-food");
});

app.listen(process.env.PORT, () => {
  console.log(`listening on http://localhost:${process.env.PORT}`);
});
