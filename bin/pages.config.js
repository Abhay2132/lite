const e = (view, title) => ({view, title})
const {resolve: r , join: j} = require("path")
const pages = {
    "/":e('index','Index'),
    "/about":e('about', "About")
}
const viewDir = j(r(), "views")
module.exports = {
    viewDir,
    baseLayout: j(viewDir, "layouts", "main.ejs"),
    pages
}