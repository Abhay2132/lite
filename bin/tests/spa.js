const spa = require('../lib/spa')
const {getRoutesFromDir} = require('../lib/dirRouter')
const {ls, pagesDir} = require("../lib/hlpr")
const {extractDeps} = require('../lib/ejs')

async function main(){
  const pages = getRoutesFromDir(pagesDir)
  // console.log(pages)
  for(let page in pages){
    const data = spa.getData(page);
    console.log({page, data});
  }
}

main();