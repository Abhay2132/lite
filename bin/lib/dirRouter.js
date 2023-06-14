const { join: j, normalize } = require("path");
const fs = require("fs");
const { engine } = require("./ejs");
const { pagesDir } = require("./hlpr");
const { base } = require("../../pages.config")

Array.prototype.log = function (label = false) {
	label ? console.log(label, this) : console.log(this);
	return this;
};

// recursive directory lister reader with callback
function list(dir, cb) {
	if (!fs.statSync(dir).isDirectory()) return cb(dir);
	fs.readdirSync(dir).forEach((item) => list(j(dir, item), cb));
}

/*
	@params - <STRING> (dir path)
	@return Object = { route : viewPath }
*/
function getRoutesFromDir(dir) {
	const routes = {};
	// path normaliser - remove / at the end
	const n = (p) =>
		(p[0] == "/" ? "/" : "") + p.split("/").filter(Boolean).join("/");

	list(dir, (file) => {
		if (!file.endsWith("page.config.js")) return;
		let view = file.slice(dir.length);
		routes[n(view.slice(0, -14))] = view.slice(1);
	});
	return routes;
}

// for Rendering pages in build time
const renderer = engine({ ejsOptions: { filename: pagesDir }, globalOptions: { base, _: pagesDir } })

function render(url, callback) {
	const configPath = j(pagesDir, url, 'page.config.js')
	if (!fs.existsSync(configPath)) throw new Error(`ENOENT : '${configPath}' does not exists !`)
	const config = defaultConfig(require(configPath));

	const { layout: layoutPath, views, data } = config;
	if (!fs.existsSync(layoutPath)) return callback(new Error(`'${layoutPath}' does not exits !`))
	renderer(layoutPath, { views, data }, callback);
}

function renderAsync(url) {
	return new Promise(res => {
		render(url, (err, html) => res(html))
	})
}

function defaultConfig(newConfig) {
	return {
		layout: j(pagesDir, 'layout.ejs'),
		data: {},
		views: {},

		...newConfig
	}
}

module.exports = {
	getRoutesFromDir,
	render,
	defaultConfig,
	renderAsync
};
