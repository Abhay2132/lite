const {Router} = require("express")
const router = Router();
const {pages} = require("../pages.config")
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

module.exports = router;