const fs = require('fs')
const fsp = require("fs/promises")
var jsonminify = require("jsonminify");

const {getData} = require("../lib/spa")
const {getRoutesFromDir} = require("../lib/dirRouter")
const {pagesDir, j,distDir, mkDir4File} = require("../lib/hlpr")

module.exports = async function (){
  console.log("building SPA data ...");
  const routes = getRoutesFromDir(pagesDir);
  for(let route in routes){
    let target = j(distDir, "_spa", route+"_.json");
  	let data = await getData(route);
    let json = jsonminify(JSON.stringify(data));
    mkDir4File(target);
  	await fsp.writeFile(target, json)
  }
}