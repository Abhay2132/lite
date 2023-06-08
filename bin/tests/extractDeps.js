const { extractDeps } = require("../lib/ejs");
const { pagesDir } = require("../lib/hlpr");
const { path : _ } = module;
const { join : j } = require('path')

const deps = extractDeps(j(pagesDir, "layout.ejs"));
console.log({deps})