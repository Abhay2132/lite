console.time("Build Finished")

const {pages, baseLayout, viewDir, ext, base} = require("./pages.config")
const {resolve: r , join: j} = require("path")
const fs = require("fs")
const {engine} = require("./ejs");

const dist = j(r(), 'dist');
const public = j(r(), "public");
makeFreshDir(dist)

const renderer = engine({
  baseLayout : baseLayout,
  // useCache: true
})

for(let page in pages){
  renderer(
    j(viewDir, pages[page].view+"."+ext),
    {...pages[page], base}, 
    function (err, html) {
      if(err) return console.error(page,"Error\n",err)
      if(!fs.existsSync(j(dist, page))) fs.mkdirSync(j(dist, page), {recursive:true})
      fs.writeFileSync(j(dist, page, "index.html"), html);
    }
  )
}

let publicFiles = readDir(public).flat()
publicFiles
.forEach((file)=>{
  let target = j(dist, file.slice(public.length))
  let dir = target.split("/").slice(0,-1).join("/")
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true})
  fs.writeFileSync(target, fs.readFileSync(file).toString())
})

function makeFreshDir(dir){
  if(fs.existsSync(dir)) fs.rmSync(dir, {recursive: true})
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})
}

function readDir(dir, fileOnly=true){
  if(!fs.statSync(dir).isDirectory()) return dir;
  let items = [];
  fs.readdirSync(dir)
  .forEach(item=>{
    items.push(readDir(j(dir, item), fileOnly))
  })
  items = items.filter(item => typeof item !== "undefined" && item.length)
  // console.log({items, fileOnly});
  if(!items.length && !fileOnly) return dir//console.log({items, fileOnly});
  return items;
}

console.timeEnd("Build Finished")