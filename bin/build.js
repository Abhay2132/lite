console.time("Build Finished");
process.on("beforeExit", () =>
	console.timeEnd("Build Finished")
);
const sass = require("sass");
const { pages, baseLayout, viewDir, ext, base } = require("../pages.config");
const {
	r,
	htmlInjector: { injectBase },
	j,
	ls,
	log,
	makeFreshDir,
	appDir,
	hash : { hash }
} = require("./lib");
const fs = require("fs");
const { engine } = require("./lib/ejs");

const dist = j(r(), "dist");
const public = j(appDir, "public");
const _spa = j(dist, "_spa");
makeFreshDir(dist);
const renderer = engine({
	useCache: false,
	baseLayout,
	base,
	globalOptions: { viewDir },
});

log({ base });
// writes pages -> html in 'dist' dir
log("building pages");
for (let page in pages) {
	let { view: view_name, css = "", js = "" } = pages[page];
	let view = j(viewDir, view_name + "." + ext);

	renderer(view, { ...pages[page], base }, function (err, html) {
		if (err) return console.error(page, "Error\n", err);
		if (!fs.existsSync(j(dist, page)))
			fs.mkdirSync(j(dist, page), { recursive: true });
		//if (base) html = injectBase(html, base);
		fs.writeFileSync(j(dist, page, "index.html"), html);
	});

	renderer(view, { layout: "empty", base, ...pages[page] }, (err, html) => {
		if (err) return console.log("_spa build error : ", err);
		let fp = j(_spa, page + "_.json");
		let dir = fp.slice(0, _spa.length);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		//  log({html})
		fs.writeFileSync(fp, JSON.stringify({ html, css, js }));
	});
	log(view);
}

// Copy 'public' dir content to 'dist'
log("building public");
ls(public).forEach((file) => {
	let target = j(dist, file.slice(public.length));
	let dir = target.split("/").slice(0, -1).join("/");
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	 fs.writeFileSync(target, fs.readFileSync(file))
	//fs.createReadStream(file).pipe(fs.createWriteStream(target));
});

// compile sass
log("building sass");
ls(j(appDir, "sass")).forEach((file) => {
	let target = j(dist, file.slice(appDir.length)).replace(".scss", ".css");
	let dir = target.split("/").slice(0, -1).join("/");
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

	fs.writeFileSync(target, sass.compile(file, { style: "compressed" }).css);
});

const normalizeURL = (url) =>
	(url[0] == "/" ? "/" : "") + url.split("/").filter(Boolean).join("/");
	
// INJECTING BASE in htmls
if(base) {
log("Injecting base");
ls(dist).filter(f => f.endsWith("index.html"))
.forEach( index => {
	let html = fs.readFileSync(index).toString();
	fs.writeFileSync(index, injectBase(html, base))
})
}

//Adding base in SW
let sw = fs.readFileSync(j(dist, "sw.js")).toString();
fs.writeFileSync(j(dist, "sw.js"), `const _base='${base}'; `+sw)

// Bundling then HASHING
log("bundling js -> dist/js/**/main.js");
require("./lib/esbuild").build()
.then(() => hash(ls(dist), 6)
.then( hashes => {
	log("Building _hashes.json");
	let new_hashes = {}
	for(let file in hashes ) {
		let new_name = base + file.slice(dist.length)
		if(new_name.endsWith("index.html")) new_name = new_name.slice(0, -10)
		new_hashes[normalizeURL(new_name)] = hashes[file];
	}
	fs.writeFileSync(j(dist, "_hashes.json"), JSON.stringify(new_hashes));
})
)
