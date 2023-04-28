const { resolve: r, join: j } = require("path")
const viewDir = j(r(), "views")
const argv = new Map();
const wait = (n, d = {}) => new Promise(r => setTimeout(() => r(d), n || 0));

process.argv.filter(Boolean).forEach(arg => {
  let [key, val = true] = arg.split("=");
  argv.set(key, val);
})

const e = (view, title, isStatic = true, loader = () => ({}), extra={}) => ({ view, title, isStatic, loader , ...extra})
const pages = {
  "/": e('index', 'Appz', !1),
  "/about": e('about', "About"),
  "/404" : e('404', "Page Not Found !")
}

module.exports = {
  viewDir,
  base: argv.get("--base") || "",
  ext: "ejs",
  baseLayout: j(viewDir, "layouts", "main.ejs"),
  pages,
  host: argv.get("--host") || ""
}