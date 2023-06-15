const { engine } = require("./ejs");
const { Router } = require("express");
const router = Router();
const { base } = require("../../pages.config");
const { resolve: r, join: j } = require("path");
const fs = require("fs");
const { appDir, log, ls, pagesDir } = require("./hlpr");
const { getRoutesFromDir } = require("./dirRouter");
const {getData} = require("./spa")

const pages = getRoutesFromDir(pagesDir);
log({pages})
const mode =
	process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev";
const plog = (...s) => process.stdout.write(s.join("")+"\n");

router.use((...a) => require('./logger')(...a))
for (let url in pages) {
	const {layout, views, data} = require(j(pagesDir, pages[url]));
	router.get(base+url, async (req, res) => {
		res.render(layout, { _ : j(pagesDir, url), views, data } ); 
	});
}

router.get(base+"/sw.js", (req, res) => {
	let data = `const __isDev = true; const base = "${base}"; ${fs.readFileSync(j(appDir, "public", "sw.js")).toString()}`
	res.header("content-type", "application/javascript");
	res.header("content-length", len);
});
// static files router 
router.use((req, res, next) => {
	let url = req.url.slice(base.length)
	let filepath = j(appDir, "public", url)
	//log({filepath})
	if(!fs.existsSync(filepath)) return next();//res.status(404).end();
	return res.sendFile(filepath);
})

if(base) router.get("/", (req, res) => res.redirect(base+"/"));

router.get(base+"/error", (req, res) => {
	res.render("error", { layout: "empty" });
});

if (mode == "dev") {
	router.use(require("./devRouter.js"));
}

const renderer = engine({ base , globalOptions : { base , _ : pagesDir} });
const depCache = new Map();
router.get(base+"/_spa/*", async (req, res) => {
	const url = req.url.slice(base.length + 5, -6);
	res.json(await getData(url));
})

router.use((req, res, next) => {
	if (req.method !== "GET") return next();
	res.status(404).end()//"/404");
});

router.use(require("../api/router"));
module.exports = router;
