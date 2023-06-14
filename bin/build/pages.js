const fs = require('fs/promises')
const {getRoutesFromDir, renderAsync} = require('../lib/dirRouter');
const {pagesDir} = require('../lib/hlpr')

module.exports = async ()=>{
  console.log('building pages');
  const routes = getRoutesFromDir(pagesDir);
  for(let route in routes){
    let html = await renderAsync(route);
    console.log({route, html})
  }
}