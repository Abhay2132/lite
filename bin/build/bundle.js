const esbuild = require('esbuild')

const {ls, distDir, j, appDir} = require('../lib/hlpr')
const src = j(appDir, "src");
const entryPoints = ls(src).filter((item) => item.endsWith(".js"));

module.exports = async function() {
	console.log("bundling JS ...")
	let res = await esbuild.build({
		entryPoints, //: ['app.ts'],
		bundle: true,
		outdir: j(distDir, "js"),
		minify: true,
	});

}