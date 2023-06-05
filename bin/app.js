const express = require("express");
const app = express();
const {
	r,
	j,
	mode,
	ejs: { engine },
	appDir,
} = require("./lib");
const { baseLayout, viewDir } = require("../pages.config");
const pagesDir = j(appDir, "pages");

//app.engine("ejs", engine({ baseLayout, globalOptions: { _ :  pagesDir } }) );
app.engine("ejs", engine({ globalOptions: { _: pagesDir } }));
app.set("views", pagesDir);
app.set("view engine", "ejs");

app.use(express.static(j(r(), mode == "dev" ? j("app", "public") : "dist")));
app.use(require("./lib/router"));

// if(mode == 'dev') require("./esbuild").watch();
module.exports = app;
