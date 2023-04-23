const ejs = require("ejs");
const fs = require("fs");
const { resolve: r, join: j } = require("path")

const ejsCache = new Map();

// make sure to enable 'useCache' in Production or use NODE_ENV='production' in env vars
// because in dev ( not 'useCache' ) we uses sync io for fast reads

function engine(eopts) {
    const { baseLayout = j(r(), "views", ""), base = false, ejsOptions={}, globalOptions = {}, useCache = (process.env.NODE_ENV || "").toLowerCase() == "production" } = eopts;

    function renderer(filepath, options, callback) {
        fs.readFile(filepath, (err, data) => {
            // const it = performance.now();
            if (err) return callback(err.stack);
            if(useCache){
                if(!ejsCache.has(baseLayout)) ejsCache.set(baseLayout, ejs.compile(fs.readFileSync(baseLayout).toString(), ejsOptions));
                let layoutTemp = ejsCache.get(baseLayout);
                if (!ejsCache.has(filepath)) ejsCache.set(filepath, layoutTemp({ base , ...globalOptions, ...options, options, body: filepath }))
                var rendered = ejsCache.get(filepath);
            } else {
                // let layoutTemp = ejs.compile(fs.readFileSync(baseLayout).toString(), ejsOptions)
                var rendered = ejs.render(fs.readFileSync(baseLayout).toString(), { base, ...globalOptions, ...options, options, body: filepath }, ejsOptions);
            }
            callback(null, rendered);
            // console.log("rendered in ", (performance.now() - it).toFixed(1) + " ms");
        })
    }
    return renderer;
}

module.exports = {
    engine
}