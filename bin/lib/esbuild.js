const esbuild = require("esbuild");
const { r, j, log, mode, ls, watcher, appDir } = require("./hlpr");
const src = j(appDir, "src");

const entryPoints = ls(src).filter((item) => item.endsWith("main.js"));

// watcher([src], async (e, file) => {
async function watch() {
	let ctx = await esbuild.context({
		entryPoints, //: ['home.ts', 'settings.ts'],
		bundle: true,
		write: true,
		outdir: j(r(), "public", "js"),
	});

	return await ctx.watch();
}

async function build(cb = false) {
	let res = await esbuild.build({
		entryPoints, //: ['app.ts'],
		bundle: true,
		outdir: j(r(), "dist", "js"),
		minify: true,
	});

	cb && cb(res);
}

module.exports = {
	watch,
	build,
};
