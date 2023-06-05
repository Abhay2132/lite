const { join: j } = require("path");
const fs = require("fs");

Array.prototype.log = function (label = false) {
	label ? console.log(label, this) : console.log(this);
	return this;
};

/*
read files of a directory and return files in a 
callback as argument one by one
	@return void
	@params 
		- dir <PATH> 
		- callback <function>
*/
function list(dir, cb) {
	if (!fs.statSync(dir).isDirectory()) return cb(dir); // [dir];
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
		if (!file.endsWith("index.ejs")) return;
		let view = file.slice(dir.length);
		routes[n(view.slice(0, -9))] = view.slice(1);
	});
	return routes;
}

module.exports = {
	getRoutesFromDir,
};
