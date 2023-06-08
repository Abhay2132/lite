const { getRoutesFromDir, render } = require('../lib/dirRouter')
const { pagesDir, j, ls } = require('../lib/hlpr')
 function main() {
  const pages = ls(pagesDir).filter(a => a.endsWith("page.config.js")).map(b => b.slice(pagesDir.length, -14)).map(c => c.length > 1 ? c.slice(0, -1) : c)
  console.log(pages)
  for(let url of pages){
    const html = render(url, (err, data)=>{
      if(err) return console.error(url, err);
      console.log({url, data})
    });
  }
}

main();