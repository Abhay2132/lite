const { resolve: r, join: j } = require("path")
const fs = require("fs");
const viewDir = j(r(),"app", "views")
const argv = new Map();
const wait = (n, d = {}) => new Promise(r => setTimeout(() => r(d), n || 0));

process.argv.filter(Boolean).forEach(arg => {
  let [key, val = true] = arg.split("=");
  argv.set(key, val);
})
const base = argv.get("--base") || ""

const e = (view, title, isStatic = true, loader = () => ({}), extra={}) => {
	let css = `${base}/sass/${view}/styles.css` 
	let data = { view, title, isStatic, loader , ...extra}
	if(fs.existsSync(j(r(), "app","sass",view,"styles.scss"))) data = {...data, css};
	return data
}
const pages = {
  "/": e('index', 'Appz', !1),
  "/about": e('about', "About"),
  "/404" : e('404', "Page Not Found !"),
  "/settings": e('settings', "Settings"),
  '/crypto': e('crypto', 'Crypto Web API')
}

module.exports = {
  viewDir,
  base,
  ext: "ejs",
  baseLayout: j(viewDir, "layouts", "main.ejs"),
  pages,
  host: argv.get("--host") || ""
}