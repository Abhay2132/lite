const { resolve: r, join: j } = require("path");
const path = require("path")
const fs = require("fs");
const {Router : _Router} = require("express")
const {base} = require("../../pages.config");

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

function mkDir4File(file){
	let dir = (file[0] == path.sep ? path.sep : '')
		+	file
			.split(path.sep)
			.slice(0,-1)
			.join(path.sep);
	if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})
}

const addBase = url => url.startsWith(base) ? url : j(base, url);

function baseRouter(){
	const _router = _Router();
	const methods = {
		get(url, ...a){
			if(typeof url == 'function') return _router.get(url, ...a);
			return _router.get(addBase(url), ...a);
		},
		use(url, ...a){
			if(typeof url == 'function') return _router.use(url, ...a);
			return _router.use(addBase(url), ...a);
		},
		post(url, ...a){
			if(typeof url == 'function') return _router.post(url, ...a);
			return _router.post(addBase(url), ...a);
		},
		put(url, ...a){
			if(typeof url == 'function') return _router.put(url, ...a);
			return _router.put(addBase(url), ...a);
		},
		delete(url, ...a){
			if(typeof url == 'function') return _router.delete(url, ...a);
			return _router.delete(addBase(url), ...a);
		}
	};
	function router(){
		return _router;
	}

	for(let key in methods){
		Object.defineProperty(router, key, {value : methods[key],enumerable: false,writable: false,configurable: false})
	}
	return router;
}

module.exports = {
	r,
	j,
	mode: process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev",
	log: console.log,
	watcher,
	ls,
	makeFreshDir,
	pagesDir: j(r(), "app", "pages"),
	viewDir: j(r(), "app", "views"),
	appDir: j(r(), "app"),
	distDir : j(r(), 'dist'),
	read : file => fs.readFileSync(file).toString(),
	mkDir4File,
	sep : path.sep,
	baseRouter
};
