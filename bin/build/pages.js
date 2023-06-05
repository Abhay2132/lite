const fs = require('fs/promises')
const {dirRouter : {getRoutesFromDir}, j, r, appDir, pagesDir} = require('../lib');

module.exports = async ()=>{
  console.log('building pages');
  const routes = getRoutesFromDir(pagesDir);
  console.log(routes);
}