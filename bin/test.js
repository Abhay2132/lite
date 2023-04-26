const esb = require('esbuild')
const { resolve: r, join: j } = require("path");
const log = console.log

esb.build({
  entryPoints: [j(r(), "src","main.js")],
  bundle: true,
  outfile: j(r(), "dist", "js", "main.js"),
  minify: true
})
.then(bundle =>{
  log({bundle})
})