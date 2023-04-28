console.time("Build Finished")

const sass = require("sass")
const { pages, baseLayout, viewDir, ext, base } = require("../pages.config")
const { r, j, ls, makeFreshDir } = require("./hlpr")
const fs = require("fs")
const { engine } = require("./ejs");

const dist = j(r(), 'dist');
const public = j(r(), "public");
const pagesDir = j(r(), "pages");

makeFreshDir(dist)

const renderer = engine({ baseLayout, base, globalOptions: { viewDir, base } })

// writes pages -> html in 'dist' dir
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


// Copy 'public' dir content to 'dist'
ls(public)
  .forEach((file) => {
    let target = j(dist, file.slice(public.length))
    let dir = target.split("/").slice(0, -1).join("/")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(target, fs.readFileSync(file).toString())
  })

// compile sass
ls(j(r(), "sass"))
  .forEach(file => {
    let target = j(dist, file.slice(r().length)).replace(".scss", ".css")
    let dir = target.split("/").slice(0, -1).join("/")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    fs.writeFileSync(target, sass.compile(file, { style: "compressed" }).css)
  })

require("./esbuild").build()
.then(() => console.timeEnd("Build Finished"))