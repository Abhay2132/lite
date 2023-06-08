const { log } = require("console");
const ejs = require("ejs");
const fs = require("fs");
const { minify } = require('html-minifier-terser');

const { mode, j, r, viewDir: defaultViewDir, pagesDir } = require("./hlpr");
const { injectBase } = require("./html_injector");

const ejsCache = new Map();

/**
 * extract file name from the source string
 * ('./_ui/card.ejs') -> ./ul/card.ejs
 * @param <STRING> str 
 * @returns <STRING>
 */
const extractFileName = str => str
	?.match(/\((.*?)\)/g)
	?.at(0)
	?.match(/(('[^']*')|("[^"]*"))/g)
	?.at(0)
	?.slice(1, -1)
	?.trim()

/**
 * add types for `extractDeps` according to extension
 * @param {String} file 
 * @returns {file : <PATH> , type : <STRING> : (css|js)}
 */
function addType(file) {
	let type = "";
	let ext = file?.split(".")?.at(-1)?.split("?")?.at(0);
	switch (ext) {
		case "css":
		case "scss":
			type = "css";
			break;
		case "js":
		case "ts":
			type = "js";
	}

	return { file, type };
}

/**
 * View dependencies extractor
 * @param {string} view 
 * @param {int} lvl 
 * @param {Set} included 
 * @returns [{file : <PATH> , type : 'css' | 'js' }]
 */
function extractDeps(view, lvl = 1, included = new Set()) {
	const regex1 = /(<%(#|-))\s*((required)|(include))(.*?)(%>)/g;
	let deps = new Set();
	if (included.has(view) || !fs.existsSync(view)) {
		return deps;
	}

	if (fs.statSync(view).isDirectory()) {
		console.error(new Error(`'${view}' is not file , but directory !\n call stack : ${JSON.stringify([...included])}`))
		return []
	}
	const source = fs.readFileSync(view).toString();
	included.add(view);
	const rootDir = view.split('/').slice(0, -1).join('/')

	while ((array1 = regex1.exec(source)) !== null) {
		const str = array1[0];
		const include = str.match(/<%-\s*include/g)
		if (include) {
			const filename = extractFileName(str) || '';
			const absIncludePath = filename[0] == '/' ? filename : j(rootDir, filename);
			extractDeps(absIncludePath, lvl + 1, included)
				.forEach(e => deps.add(e))
			continue;
		}
		deps.add(extractFileName(array1[0]));
	}

	if (lvl == 1) return Array.from(deps).map(addType);
	return deps;
}

function engine({ globalOptions = {}, ejsOptions = {} }) {
	return function renderer(filepath, options, callback) {
		const base = options?.base || globalOptions?.base || "";
		ejs.renderFile(
			filepath,
			{ ...globalOptions, ...options, base, j, extractDeps, __: filepath.split("/").slice(0, -1).join("/") },
			{ ...ejsOptions },
			async (err, str) => {
				let html = injectBase(str, base);
				callback(err, html)
			}
		);
	};
}

module.exports = {
	engine,
	extractDeps
};
