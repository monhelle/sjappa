const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const Food = require("./models/Food")

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}))

app.use(express.static("public"))


// mongoose.connect("mongodb://localhost:27017/sjappa");
mongoose.connect(process.env.MONGODB_URI);

app.get("/", async (req, res) => {
    const food = await Food.find();
    console.log(food);

    res.render("index", {food});
    

})

app.get("/register-food", (req, res) => {
    res.render("registerFood")
})

app.post("/register-food", async (req, res) => {
    const {
        bildeurl,
        tittel, 
        beskrivelse, 
        ingredienser, 
        kategori, 
        pris
    } = req.body;
    console.log(req.body);

    const food = new Food({
        bildeurl,
        tittel, 
        beskrivelse, 
        ingredienser,
        kategori, 
        pris});

       await food.save();
    res.status(200).redirect("/register-food");
})



app.listen(process.env.PORT);