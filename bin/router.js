const {Router} = require("express")
const router = Router();
const {pages} = require("./pages.config")

router.use((req, res, next)=>{
    let it = performance.now();
    res.on("finish", ()=>{
        console.log(res.statusCode, req.method, req.url, (performance.now()-it).toFixed(1)+" ms")
    })
    next();
})

for(let url in pages){
    router.get(url, (req, res)=>{
        res.render(pages[url].view,{...pages[url]})
    })
}

module.exports = router;