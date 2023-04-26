console.time("Build Finished")

const { pages, baseLayout, viewDir, ext, base } = require("../pages.config")
const { resolve: r, join: j } = require("path")
const fs = require("fs")
const { engine } = require("./ejs");

const dist = j(r(), 'dist');
const public = j(r(), "public");
const pagesDir = j(r(), "pages");

makeFreshDir(dist)

const renderer = engine({ baseLayout, base })

// writes pages html in 'dist' dir
for (let page in pages) {
  renderer(
    j(viewDir, pages[page].view + "." + ext),
    { ...pages[page], base },
    function (err, html) {
      if (err) return console.error(page, "Error\n", err)
      if (!fs.existsSync(j(dist, page))) fs.mkdirSync(j(dist, page), { recursive: true })
      fs.writeFileSync(j(dist, page, "index.html"), html);
    }
  )
}


function makeFreshDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// same as ls -R in cli
function ls(dir) {
  if (!fs.statSync(dir).isDirectory()) return [dir];
  let items = [];
  fs.readdirSync(dir)
    .forEach(item => {
      items = [...items, ...ls(j(dir, item))];
    })
  return items.filter(Boolean);
}

// Copy 'public' dir content to 'dist'
ls(public)
  .forEach((file) => {
    let target = j(dist, file.slice(public.length))
    let dir = target.split("/").slice(0, -1).join("/")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(target, fs.readFileSync(file).toString())
  })

console.timeEnd("Build Finished")