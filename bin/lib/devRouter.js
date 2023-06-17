const { appDir, distDir, log, ls, j, baseRouter } = require("./hlpr");
const { base } = require("../../pages.config");
const sass = require("sass");
const fs = require("fs")
const { createHash } = require('node:crypto');

const router = baseRouter();
router.get("/sw.js", (req, res) => {
	let data = `const __isDev = true; \nconst _base = "${base}"; ${fs.readFileSync(j(appDir, "public", "sw.js")).toString()}`
	res.header("content-type", "application/javascript");
	res.header("content-length", data.length);
	res.end(data);
});

router.get("/sass/*", (req, res, next) => {
	let scssPath = j(appDir, req.url.slice(base.length)); //, req.url.replace(/(\.\.)/g, "").replace(/(\/\/)/g, ''));
	if (scssPath.endsWith(".css")) scssPath = scssPath.slice(0, -3) + "scss";
	if (!require("fs").existsSync(scssPath)) return r404(res);
	let { css } = sass.compile(scssPath);
	res.header("Content-Type", "text/css");
	res.header("Content-Length", css.length);
	res.end(css);
});

router.get("/js/*", (req, res, next) => {
	res.sendFile(j(appDir, "src", req.url.slice(base.length + 4)));
});

router.get("/_hash/*", async (req, res) => {
	let url = req.url.slice(base.length + 6);
	if (url.endsWith(".txt")) url = url.slice(0, -4);
	if (url.match(/\/?_hash\/(.*?)/g)) return res.status(422).json({ error: `url should not be '/_hash/_hash/*'` });
	let response = false;
	let error = false
	try {
		response = await fetch(j("http://localhost:3000", url));
	} catch (e) { errror = e; console.error("hash_ERROR :", e) }
	if (error) return res.status(500).end(error.stack);
	let ab = await response.arrayBuffer();
	let hash = createHash("sha1");
	hash.update(Buffer.from(ab));
	let hex = hash.digest("hex").slice(0, 6);
	res
		.header("content-length", Buffer.byteLength(hex))
		.header('content-type', 'text/plain')
		.end(hex);
})

router.get("/api/wait", (req, res) => {
	let n = parseInt(req.query.n || "") || 0;
	setTimeout(() => res.end(), n);
});

router.use("/api/serverError", (req, res) => {
	res.status(500).end("server error")
});

function r404(res) {
	res.status(404).end();
}
module.exports = router()
