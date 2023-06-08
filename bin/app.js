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
app.engine("ejs", engine({ globalOptions: { _: pagesDir }, ejsOptions: {filename: pagesDir} }));
app.set("views", pagesDir);
app.set("view engine", "ejs");

app.use(express.static(j(r(), mode == "dev" ? j("app", "public") : "dist")));
app.use(require("./lib/router"));

import("chalk")
.then(c=> {
	//console.log(c)
	global.chalk = c.default
})

// if(mode == 'dev') require("./esbuild").watch();
module.exports = app;
