const fsp = require('fs/promises')
const fs = require('fs')
const { minify } = require('html-minifier-terser')
const {base} = require("../../pages.config")
const {getRoutesFromDir, renderAsync} = require('../lib/dirRouter');
const {pagesDir, distDir, j } = require('../lib/hlpr')
const {injectBase} = require("../lib/html_injector")

module.exports = async ()=>{
  console.log('building pages');
  const routes = getRoutesFromDir(pagesDir);
  for(let route in routes){
    let dir = j(distDir, route);
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    let target = j(dir, 'index.html');
    let html = await renderAsync(route);
    html = injectBase(html, base);
    const result = await minify(html, {
      removeAttributeQuotes: true,
      minifyCSS: true,
      minifyJS : true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await fsp.writeFile(target, result);
  }
} 