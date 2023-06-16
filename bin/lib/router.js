const { engine } = require("./ejs");
const { Router } = require("express");
const router = Router();
const { base } = require("../../pages.config");
const { resolve: r, join: j } = require("path");
const fs = require("fs");
const { appDir, log, ls, pagesDir } = require("./hlpr");
const { getRoutesFromDir , defaultConfig } = require("./dirRouter");
const {getData} = require("./spa")

const pages = getRoutesFromDir(pagesDir);
log({pages})
const mode =
	process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev";
const plog = (...s) => process.stdout.write(s.join("")+"\n");

router.use((...a) => require('./logger')(...a))
for (let url in pages) {
	const {layout, views, data} = defaultConfig(require(j(pagesDir, pages[url])));
	router.get(base+url, async (req, res) => {
		res.render(layout, { _ : j(pagesDir, url), views, data } ); 
	});
}
if(base) router.get("/", (req, res) => res.redirect(base+"/"));
 
if (mode == "dev") {
	router.use(require("./devRouter.js"));
}

// static files router 
router.use((req, res, next) => {
	let url = req.url.slice(base.length)
	let filepath = j(appDir, "public", url)
	//log({filepath})
	if(!fs.existsSync(filepath)) return next();//res.status(404).end();
	return res.sendFile(filepath);
})

router.get(base+"/error", (req, res) => {
	res.render("error", { layout: "empty" });
});

const renderer = engine({ base , globalOptions : { base , _ : pagesDir} });
const depCache = new Map();
router.get(base+"/_spa/*", async (req, res) => {
	const url = req.url.slice(base.length + 5, -6);
	getData(url)
	.then(json => res.json(json))
	.catch(err=> res.status(404).json(err))
})

router.use((req, res, next) => {
	if (req.method !== "GET") return next();
	res.status(404).end()//"/404");
});

router.use(require("../api/router"));
module.exports = router;
