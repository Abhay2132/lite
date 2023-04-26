const {Router} = require("express")
const router = Router();
const {pages} = require("../pages.config")
const { resolve: r, join: j } = require("path");
const mode = process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev";

router.use((req, res, next)=>{
    let it = performance.now();
    res.on("finish", ()=>{
        console.log(res.statusCode, req.method, req.url, (performance.now()-it).toFixed(1)+" ms")
    })
    next();
})

for(let url in pages){
    const o = pages[url];
    if(o.isStatic && mode=="pro") continue;
    router.get(url, async (req, res)=>{
        let extra = await o.loader();
        res.render(o.view,{...o, ...extra})
    })
}

router.get("/error",(req,res)=>{
    res.render("error", {layout: "empty"})
})

if(mode=="dev") router.get("/sass/*", (req, res, next)=>{
    const sass = require("sass")
    let url = j(r(),req.url.replace(/(\.\.)/g, "").replace(/(\/\/)/g, ''));
    if(url.endsWith(".css")) url = url.slice(0,-3)+"scss"
    if(!require('fs').existsSync(url)) return r404(res);
    let {css} = sass.compile(url);
    res.header('Content-Type', 'text/css')
    res.header('Content-Length', css.length)
    res.end(css);
})

router.use(require("./api/router"));
module.exports = router;

function r404(res){
    res.writeHead(404);
    res.end();
}