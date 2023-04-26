const sass = require("sass")
const { resolve: r, join: j } = require("path");
const log = console.log

const css = sass.compile(j(r(),"scss", "global.scss"))
log({css})