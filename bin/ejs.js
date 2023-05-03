const { log } = require("console");
const ejs = require("ejs");
const fs = require("fs");
const { mode, r,j,injectBase } = require("./hlpr")

const ejsCache = new Map();

function engine({
    baseLayout = j(r(), "views", "empty.ejs"),
    base = '',
    ejsOptions = {},
    globalOptions = {},
    useCache = process.env?.NODE_ENV?.toLowerCase() === "production",
    viewDir = j(r(), "views")
}) {
    // const = eopts;
    const getLayoutPath = (name="") => {
        if(!name.endsWith(".ejs")) name += ".ejs"
        if(!name.startsWith("/")) name = j(viewDir, "layouts", name);
        return name;
    }
    
    baseLayout = getLayoutPath(baseLayout);
    //  memoize layout
    ejsCache.set(baseLayout, ejs.compile(fs.readFileSync(getLayoutPath(baseLayout)).toString(), ejsOptions));
    function renderer(filepath, options, callback) {
        let rendered = "";
        let renderOpts = { base, ...globalOptions, ...options, options, body: filepath }
        let { layout = baseLayout } = options;
        layout = getLayoutPath(layout);

        if (layout != baseLayout) {
            !ejsCache.has(layout) && ejsCache.set(layout, ejs.compile(fs.readFileSync(layout).toString(), ejsOptions))
        }
        // log({layout})
        var err = null
        // three cache strategies :-
        // 1. `isStatic` (for prodcution mode) : when a page dont't need any dynamic data like db search result
        // 2. `useCache` (for production mode) : when a page needs dynamically loaded data in `options`
        // 3. `none`     (for dev mode)        : recompile the whole template on every request
        try {
            // log(options.isStatic, useCache, mode)
            if (options.isStatic && mode == 'pro') {
                // log("static")
                if (ejsCache.has(filepath)) return callback(null, ejsCache.get(filepath));
                if (!ejsCache.has(filepath)) ejsCache.set(filepath, ejsCache.get(layout)(renderOpts))
                rendered = ejsCache.get(filepath);
            }
            else if (useCache) {
                // log("useCache", layout)
                rendered = ejsCache.get(layout)(renderOpts)
            }
            else {
                // log("re-render")
                rendered = ejs.render(fs.readFileSync(layout).toString(), renderOpts, ejsOptions);
            }
        } catch (e) {
            err = e;
            console.log(err);
        }
		
		rendered = injectBase(rendered, base)
		//log(rendered)
        callback(err, rendered);
    }
    
    return renderer;
}

module.exports = {
    engine
}
