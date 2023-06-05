const { appDir, log, ls, j } = require("./hlpr");
const { Router } = require("express");
const router = Router();
const { hash } = require("./hash")
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

router.get("/_hashes.json", (req, res) => {
	hash(ls(appDir), 6).then((hashes) => {
		let new_hashes = {};
		for (let file in hashes) {
			new_hashes[file.slice(appDir.length)] = hashes[file];
		}
		res.json(new_hashes);
	});
});

module.exports = router;
