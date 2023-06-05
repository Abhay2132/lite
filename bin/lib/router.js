const { engine , extractDeps} = require("./ejs");
const { Router } = require("express");
const router = Router();

const { baseLayout, base, viewDir } = require("../../pages.config");
const { resolve: r, join: j } = require("path");
const fs = require("fs");

const { readFileSync } = require("fs");
const { appDir, log, ls, pagesDir } = require("./hlpr");
const { hash } = require("./hash");

const { getRoutesFromDir } = require("./dirRouter");
const { render } = require("ejs");
const pages = getRoutesFromDir(pagesDir);
log({pages})
const mode =
	process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev";

router.use((req, res, next) => {
	let it = performance.now();
	let l = () =>
		console.log(
			res.statusCode,
			req.method,
			req.url,
			(performance.now() - it).toFixed(1) + " ms"
		);
	res.on("finish", l);
	next();
});

//console.table(pages);
for (let url in pages) {
	const o = pages[url];
	//if (o.isStatic && mode == "pro") continue;
	router.get(url, async (req, res) => {
		//let extra = await o.loader();
		res.render(o); //, { ...o, ...extra });
	});
}

router.get("/error", (req, res) => {
	res.render("error", { layout: "empty" });
});

if (mode == "dev") {
	router.use(require("./devRouter.js"));
}

const renderer = engine({ base , globalOptions : { base , _ : pagesDir} });
const depCache = new Map();
router.get("/_spa/*", async (req, res, next) => {
	
	let href = req.url.slice(5, -6);
	if (!pages.hasOwnProperty(href))
		return res.json({
			error: `href (${href}) is not configed in pages.config.js`,
		});
	// let { view, css = "", js = "" } = pages[href];
	let viewPath = j(pagesDir, pages[href]);
	let viewDir = viewPath.split('/').slice(0,-1).join('/')
	const configPath  = j(viewDir, 'page.config.js');
	if(!fs.existsSync(configPath)) return res.json({error:'page.config.js not found for current pages which contains the spa details'})
	
	let {views} = require(configPath);
	let css = []
	let js = []
	let html = {}

	for (let view in views) {
		const viewPath = views[view];
		deps = extractDeps(viewPath);
		deps.forEach(d =>{
			if(d.type == 'css') css.push(d.file);
			if(d.type == 'js') js.push(d.file);
		})
		let {err, data = ""} = await getView(viewPath);
		if(err) {console.log(err)//, !!res.json({error : err.stack}))
		continue;}
		html[view] = data;
	}
	
	return res.json({html, css, js})
});

const getView = view => new Promise(res => {
	renderer(view, {}, (err, data)=> res({err, data}))
})

router.use((req, res, next) => {
	if (req.method !== "GET") return next();
	res.redirect("/404");
});

router.use(require("../api/router"));
module.exports = router;
