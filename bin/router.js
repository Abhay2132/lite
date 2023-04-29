const {engine} = require("./ejs");
const { Router } = require("express")
const router = Router();
const { baseLayout, base, pages, viewDir } = require("../pages.config")
const { resolve: r, join: j } = require("path");
const { log } = require("console");
const { readFileSync } = require("fs");
const mode = process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev";

router.use((req, res, next) => {
    let it = performance.now();
    res.on("finish", () => {
        console.log(res.statusCode, req.method, req.url, (performance.now() - it).toFixed(1) + " ms")
    })
    next();
})

for (let url in pages) {
    const o = pages[url];
    if (o.isStatic && mode == "pro") continue;
    router.get(url, async (req, res) => {
        let extra = await o.loader();
        res.render(o.view, { ...o, ...extra })
    })
}

router.get("/error", (req, res) => {
    res.render("error", { layout: "empty" })
})

if (mode == "dev") {
    router.get("/sass/*", (req, res, next) => {
        const sass = require("sass")
        let url = j(r(), req.url.replace(/(\.\.)/g, "").replace(/(\/\/)/g, ''));
        if (url.endsWith(".css")) url = url.slice(0, -3) + "scss"
        if (!require('fs').existsSync(url)) return r404(res);
        let { css } = sass.compile(url);
        res.header('Content-Type', 'text/css')
        res.header('Content-Length', css.length)
        res.end(css);
    })

    router.get("/js/*", (req, res, next) => {
        res.sendFile(j(r(),"src",req.url.slice(4)));
    })
}

const renderer = engine({baseLayout:'empty', base, viewDir})
router.get("/_spa/*",(req, res, next)=>{
    let href = req.url.slice(5, -6);
    if(!pages.hasOwnProperty(href)) return res.json({error:`href (${href}) is not configed in pages.config.js`});
    let view = j(viewDir, pages[href].view+".ejs")
    renderer(view, pages[href], (err, html)=>{
        if(err) return res.json({error: err.stack}) && console.log(err);
        res.json({html});
    })
})

router.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.redirect('/404')
})

router.use(require("./api/router"));
module.exports = router;

function r404(res) {
    res.writeHead(404);
    res.end();
}