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
    // console.log({data})
    data.split("\n")
    .forEach(line=>{
        if(line.length<1) return;
        let parts = line.split("=")
        // console.log('i',{parts})
        if(parts.length>2) parts[1] = parts.slice(1).join("");
        // console.log({parts});
        let name = parts[0].trim();
        let value = parts[1].trim()
        if(
            (value[0]=="'" && value[value.length-1] == "'")
            || (value[0]=='"' && value[value.length-1]=='"')
        )
            value = value.slice(1,-1)
        
        map.set(name, value)
    })
    return map;
}