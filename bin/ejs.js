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

        var err = null
        // three cache strategies :-
        // 1. `useCache` (for production mode) : when a page needs dynamically loaded data in `options`
        // 2. `none`     (for dev mode)        : recompile the whole template on every request
        try {
			if (useCache) {
                rendered = ejsCache.get(layout)(renderOpts)
            }
            else {
                rendered = ejs.render(fs.readFileSync(layout).toString(), renderOpts, ejsOptions);
            }
        } catch (e) {
            err = e;
            console.log(err);
        }
		
		rendered = injectBase(rendered, base)
        callback(err, rendered);
    }
    
    return renderer;
}

module.exports = {
    engine
}
