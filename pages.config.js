const { resolve: r, join: j } = require("path")
const viewDir = j(r(), "views")
const argv = new Map();
const wait = (n, d = {}) => new Promise(r => setTimeout(() => r(d), n || 0));

process.argv.filter(Boolean).forEach(arg => {
  let [key, val = true] = arg.split("=");
  argv.set(key, val);
})

const e = (view, title, isStatic = true, loader = () => ({})) => ({ view, title, isStatic, loader })
const pages = {
  "/": e('index', 'Appz', !1),
  "/about": e('about', "About"),
}

module.exports = {
  viewDir,
  base: argv.get("--base") || "",
  ext: "ejs",
  baseLayout: j(viewDir, "layouts", "main.ejs"),
  pages
}