const express = require("express");
const app = express();
const {
	r,
	j,
	mode,
	ejs: { engine },
} = require("./lib");
const { baseLayout, viewDir } = require("../pages.config");

app.engine("ejs", engine({ baseLayout, globalOptions: { viewDir } }));
app.set("views", viewDir);
app.set("view engine", "ejs");

app.use(express.static(j(r(), mode == "dev" ? j("app","public") : "dist")));
app.use(require("./lib/router"));

// if(mode == 'dev') require("./esbuild").watch();
module.exports = app;
