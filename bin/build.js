console.time("Build Finished")

const sass = require("sass")
const { pages, baseLayout, viewDir, ext, base } = require("../pages.config")
const { r, j, ls, log,makeFreshDir } = require("./hlpr")
const fs = require("fs")
const { engine } = require("./ejs");

const dist = j(r(), 'dist');
const public = j(r(), "public");
const _spa = j(dist, "_spa");
makeFreshDir(dist)
const renderer = engine({ baseLayout, base, globalOptions: { viewDir } })

// writes pages -> html in 'dist' dir
for (let page in pages) {
  let view = j(viewDir, pages[page].view + "." + ext);
  renderer(
    view,
    { ...pages[page], base },
    function (err, html) {
      if (err) return console.error(page, "Error\n", err)
      if (!fs.existsSync(j(dist, page))) fs.mkdirSync(j(dist, page), { recursive: true })
      fs.writeFileSync(j(dist, page, "index.html"), html);
    }
  )

  renderer(view, {layout: 'empty', base, ...pages[page]},
    (err, html)=>{
      if(err) return console.log("_spa build error : ", err)
      let fp = j(_spa, page+'_.json');
      let dir = fp.slice(0, _spa.length);
      if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
      // log(html.slice(0,html.indexOf("\n")))
      fs.writeFileSync(fp, JSON.stringify({html}))
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