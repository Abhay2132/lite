const express = require('express')
const app = express();
const { engine } = require("./ejs")
const {r,j,mode} = require("./hlpr")
const { baseLayout , viewDir} = require("../pages.config")

app.engine("ejs", engine({ baseLayout , globalOptions:{viewDir}}));
app.set('views', "./views");
app.set("view engine", "ejs");

app.use(express.static(j(r(), mode == "dev" ? "public" : "dist")));
app.use(require("./router"));

if(mode == 'dev') require("./esbuild").watch();
module.exports = app;