const fs = require('fs')
const {base} = require("../../pages.config")
const {mkDir4File, j , distDir, ls, appDir} = require("../lib/hlpr")

module.exports = async function() {
	let public = j(appDir, "public")
	ls(public).forEach((file) => {
		let target = j(distDir, file.slice(public.length));
		if(fs.existsSync(target)) throw new Error(`'${target}' already exists in 'dist' directory !`)
		mkDir4File(target);
		fs.writeFileSync(target, fs.readFileSync(file));
		//fs.createReadStream(file).pipe(fs.createWriteStream(target));
	});

	let sw = fs.readFileSync(j(distDir, "sw.js")).toString();
	fs.writeFileSync(j(distDir, "sw.js"), `const _base='${base}'; ` + sw);
}