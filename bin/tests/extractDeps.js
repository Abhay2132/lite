const { extractDeps } = require("../lib/ejs");
const { pagesDir } = require("../lib/hlpr");
const { path : _ } = module;
const { join : j } = require('path')

const view = j(pagesDir, "layout.ejs")
const config = require(j(pagesDir, "page.config.js"))
const data = {
	j,
	...config
}
const deps = extractDeps({data , view});
console.log({deps})