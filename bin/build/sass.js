const sass = require("sass");
const fs = require("fs")
const { j, ls, sep, appDir, distDir,mkDir4File } = require('../lib/hlpr');
module.exports = async function() {
	console.log("Building SASS ...");
	ls(j(appDir, "sass")).forEach((file) => {
		let target = j(distDir, file.slice(appDir.length)).replace(".scss", ".css")
		mkDir4File(target)
		fs.writeFileSync(target, sass.compile(file, { style: "compressed" }).css);
	});
}