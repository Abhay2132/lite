const express = require('express')
const app = express();
const { engine } = require("./ejs")
const { resolve: r, join: j } = require("path");
const mode = process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev";
const { baseLayout } = require("../pages.config")

app.engine("ejs", engine({ baseLayout }));
app.set('views', "./views");
app.set("view engine", "ejs");

app.use(express.static(j(r(), mode == "dev" ? "public" : "dist")));
app.use(require("./router"));

module.exports = app;