const fs = require("fs");

const e = (view, title) => ({view, title})
const {resolve: r , join: j} = require("path")
const pages = {
    "/":e('index','Index'),
    "/about":e('about', "About")
}
const viewDir = j(r(), "views")
var base = "/"
if(fs.existsSync(j(r(),".env"))){
    let env = parseEnv(j(r(),".env"))
    // console.log(env)
    base = env.get("BASE_URL") || base;
}

module.exports = {
    viewDir,
    base,
    ext : "ejs",
    baseLayout: j(viewDir, "layouts", "main.ejs"),
    pages
}

// return env map
function parseEnv (env){ 
    let map = new Map();
    let data = fs.readFileSync(env).toString();
    data.split("\n")
    .forEach(line=>{
        let parts = line.split("=")
        if(parts.length>2) parts[1] = parts.slice(1).join("");
        console.log(parts);
        let name = parts[0].trim();
        let value = eval(parts[1].trim())
        map.set(name, value)
    })
    return map;
}