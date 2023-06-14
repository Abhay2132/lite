console.time('Build Finished')

const fs = require('fs')
const pages = require('./pages')
const spa = require('./spa.js')
const public = require("./public.js");
const sass = require("./sass");
const bundle = require('./bundle');
const hash = require("./hash")
const {makeFreshDir, distDir} = require("../lib/hlpr");

makeFreshDir(distDir);

Promise.all([
  pages(),
  spa(),
  public(),
  sass(),
  bundle(),
  hash(),
])
.then(()=>{
  console.timeEnd('Build Finished')
})
// .error(console.error) 