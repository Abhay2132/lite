console.time('Build Finished : ')
const pages = require('./pages')

Promise.all([
  pages(),
])
.then(()=>{
  console.timeEnd('Build Finished : ')
})