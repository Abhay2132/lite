const { log } = require("console");
const fs = require("fs");
const { join : j } = require("path");
const { appDir } = require("../lib/hlpr");

const rootDir = __dirname;
const extractFileName = str => str
?.match(/\((.*?)\)/g)
?.at(0)
?.match(/(('[^']*')|("[^"]*"))/g)
?.at(0)
?.slice(1, -1)
?.trim()

// single dependency parser
function depParser(str) {
	// console.log(str);
	let file = extractFileName(str);
	
	// if(file[0] == '@') file = appDir
	let type = "";
	switch (file?.split(".")?.at(-1)?.split("?")?.at(0)) {
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

// extract dependencies of a predefined format
// from a view or ejs file
// format - <%# required('/js/main.js') %>
function extractDeps(view, included = new Set()) {
	const regex1 = /(<%(#|-))\s*((required)|(include))(.*?)(%>)/g;
	// console.log({view})
	let deps = [];
	if(included.has(view) || !fs.existsSync(view)) {console.log('returned', {view, included}); return deps;}

	const source = fs.readFileSync(view).toString();
	// console.log({view, source})
	included.add(view);
	const rootDir = view.split('/').slice(0,-1).join('/')
	while ((array1 = regex1.exec(source)) !== null) {
		const str = array1[0];
		const include = str.match(/<%-\s*include/g)
		// console.log(str)
		if(include) {
			const filename = extractFileName(str);
			const absIncludePath = str[0] == '/' ? filename : j(rootDir,filename);
			deps = [...deps, ...extractDeps(absIncludePath, included)]
			continue;
		}
		deps.push(depParser(array1[0]));
	}
	
	return deps;
}

console.log(extractDeps(__dirname+"/view.ejs"))
