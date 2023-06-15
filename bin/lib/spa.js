const { pagesDir, j } = require('./hlpr')
const { defaultConfig } = require('./dirRouter')
const fs = require('fs')
const { minify } = require('html-minifier-terser')
const { extractDeps, engine } = require('./ejs')
const {base} = require("../../pages.config");
const {injectBase} = require("./html_injector");
/**
 * get spa data for build and SSR
 * @param {relative path} pageURL 
 * @returns {error, html, css, js}
 */
async function getData(pageURL) {
  const dir = j(pagesDir, pageURL);
  const configPath = j(dir, 'page.config.js')
  if (!fs.existsSync(configPath)) throw new Error(`config '${configPath}' does not exits !`)
  const config = (require(configPath) || {});
  config._ = dir;
  const { layout = '', title = '', views = {}, data = {} } = defaultConfig(config);
  if (!fs.existsSync(layout)) return { error: new Error(`layout '${layout}' does not exits !`) }
  // console.log({config, pageURL})
  let html = { ...data },
    css = new Set(),
    js = new Set();
  const deps = extractDeps({ view: layout, data: { views, data } });
  for (let key in views) {
    let htm = await getView(views[key], config);
    const minHTML = await minify(htm, {
      removeAttributeQuotes: true,
      minifyCSS: true,
      minifyJS: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    html[key] = minHTML;
  }
  deps.forEach(dep => {
    if (dep.type == 'css') css.add(dep.file);
    if (dep.type == 'js') js.add(dep.file);
  })
  return { html, css: Array.from(css), js: Array.from(js) }
}
const render = engine({ ejsOptions: { filename: pagesDir } })
const getView = (absPath, config) => new Promise(res => render(absPath, config, (err, html) => err ? console.error(err) && res() : res(injectBase(html, base))))
module.exports = {
  getData
}