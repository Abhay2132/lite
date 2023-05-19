const { engine } = require("./ejs");
const { Router } = require("express");
const router = Router();
const { baseLayout, base, pages, viewDir } = require("../../pages.config");
const { resolve: r, join: j } = require("path");
const fs = require("fs")

const { readFileSync } = require("fs");
const { appDir, log ,ls } = require("./hlpr");
const { hash } = require("./hash");

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

for (let url in pages) {
	const o = pages[url];
	if (o.isStatic && mode == "pro") continue;
	router.get(url, async (req, res) => {
		let extra = await o.loader();
		res.render(o.view, { ...o, ...extra });
	});
}

router.get("/error", (req, res) => {
	res.render("error", { layout: "empty" });
});

if (mode == "dev") {
	const sass = require("sass");
	router.get("/sass/*", (req, res, next) => {
		let scssPath = j(appDir, req.url); //, req.url.replace(/(\.\.)/g, "").replace(/(\/\/)/g, ''));
		if (scssPath.endsWith(".css")) scssPath = scssPath.slice(0, -3) + "scss";
		if (!require("fs").existsSync(scssPath)) return r404(res);
		let { css } = sass.compile(scssPath);
		res.header("Content-Type", "text/css");
		res.header("Content-Length", css.length);
		res.end(css);
	});

	router.get("/js/*", (req, res, next) => {
		res.sendFile(j(appDir, "src", req.url.slice(4)));
	});
	
	router.get("/sw.js", (req, res) => {
		const sw = fs.readFileSync(j(appDir, "public", "sw.js")).toString();
		const new_sw = "const _isDev = true; \n" + sw;
			res.setHeader("Content-Type", "application/javascript");
			res.setHeader("Content-Length", new_sw.length);
			res.end(new_sw);
	});
	
	router.get("/_hashes.json", (req, res) => {
		hash(ls(appDir), 6)
		.then( hashes => {
			let new_hashes = {}
			for(let file in hashes){
				new_hashes[file.slice(appDir.length)] = hashes[file];
			}
			res.json(new_hashes);
		});
	});
}

const renderer = engine({ baseLayout: "empty", base, viewDir });
router.get("/_spa/*", (req, res, next) => {
	let href = req.url.slice(5, -6);
	if (!pages.hasOwnProperty(href))
		return res.json({
			error: `href (${href}) is not configed in pages.config.js`,
		});
	let { view, css = "", js = "" } = pages[href];
	let viewPath = j(viewDir, view + ".ejs");
	renderer(viewPath, pages[href], (err, html) => {
		if (err) return res.json({ error: err.stack }) && console.log(err);
		res.json({ html, css, js });
	});
});

router.use((req, res, next) => {
	if (req.method !== "GET") return next();
	res.redirect("/404");
});

router.use(require("../api/router"));
module.exports = router;

function r404(res) {
	res.writeHead(404);
	res.end();
}
