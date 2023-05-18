const { resolve: r, join: j } = require("path");
const fs = require("fs");

const lastWatch = { name: "", time: performance.now() };
function watcher(dirs, cb) {
	for (let dir of dirs) {
		fs.watch(dir, (e, f) => {
			let fp = j(dir, f);
			if (e == "rename" && fs.existsSync(fp) && fs.statSync(fp).isDirectory())
				return watcher([fp], cb);

			if (
				(lastWatch.name == f || lastWatch.type == "rename") &&
				performance.now() - lastWatch.time < 500
			)
				return;
			cb(e, fp);
			lastWatch.name = f;
			lastWatch.time = performance.now();
			lastWatch.type = e;
		});
		let files = fs.readdirSync(dir);
		for (let file of files) {
			if (fs.statSync(j(dir, file)).isDirectory()) watcher([j(dir, file)], cb);
		}
	}
}

function makeFreshDir(dir) {
	if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ls(dir) {
	if (!fs.statSync(dir).isDirectory()) return [dir];
	let items = [];
	fs.readdirSync(dir).forEach((item) => {
		items = [...items, ...ls(j(dir, item))];
	});
	return items.filter(Boolean);
}

module.exports = {
	r,
	j,
	mode: process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev",
	log: console.log,
	watcher,
	ls,
	makeFreshDir,

	viewDir: j(r(), "app", "views"),
	appDir: j(r(), "app"),
};
