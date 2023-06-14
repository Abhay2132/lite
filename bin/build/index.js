console.time('Build Finished : ')
const pages = require('./pages')
const spa = require('./spa.js')
const public = require("./public.js");
const sass = require("./sass");
const bundle = require('./bundle')

Promise.all([
  pages(),
  spa(),
  public(),
  sass(),
  bundle()
])
.then(()=>{
  console.timeEnd('Build Finished : ')
})
// .error(console.error)