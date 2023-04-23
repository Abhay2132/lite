const express = require('express')
const app = express();
const { engine } = require("./ejs")
const { resolve: r, join: j } = require("path");

const engineOptions = { 
    baseLayout: j(r(), "views", "layouts", "main.ejs") ,
    // base : process.env.BASE_URL || "/",
    // globalOptions: {title: "Apps"},
    // useCache: true
}

app.engine("ejs", engine(engineOptions));
app.set('views', "./views");
app.set("view engine", "ejs");

app.use(express.static(j(r(),"public")));
app.use(require("./router"));

module.exports = app;