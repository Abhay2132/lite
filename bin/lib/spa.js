const { pagesDir , j } = require('./hlpr')
const {defaultConfig} = require('./dirRouter')
const fs = require('fs')
const { extractDeps } = require('./ejs')
/**
 * 
 * @param {relative path} pageURL 
 * @returns {error, html, css, js}
 */
function getData (pageURL){
  const configPath = j(pagesDir, pageURL, 'page.config.js')
  if(!fs.existsSync(configPath)) throw new Error(`config '${configPath}' does not exits !`)
  const config = (require(configPath) || {});
  const {layout, title, views, data} = defaultConfig(config);
  if(!fs.existsSync(layout)) return {error: new Error(`layout '${layout}' does not exits !`)}

  let html = {}, css = new Set(), js = new Set(); 
  const deps = extractDeps(layout);
  // console.log({layout, pageURL, deps})
  deps.forEach(dep =>{
    if(dep.type == 'css') css.add(dep.file);
    if(dep.type == 'js') js.add(dep.file);
  })

  return {html, css : Array.from(css), js : Array.from(js)}
}

module.exports = {
  getData
}