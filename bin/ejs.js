const ejs = require("ejs");
const fs = require("fs");
const { resolve: r, join: j } = require("path")

const ejsCache = new Map();

function engine(eopts) {
    const {
        baseLayout = j(r(), "views", ""),
        base = '',
        ejsOptions = {},
        globalOptions = {},
        useCache = process.env?.NODE_ENV?.toLowerCase() === "production",
        viewDir = j(r(), "views")
    } = eopts;
    const getLayoutPath = (name) => j(viewDir, "layouts", name + (name.endsWith(".ejs") ? "" : ".ejs"));

    //  memoize layout
    ejsCache.set(baseLayout, ejs.compile(fs.readFileSync(baseLayout).toString(), ejsOptions));
    function renderer(filepath, options, callback) {
        let rendered = "";
        let renderOpts = { base, ...globalOptions, ...options, options, body: filepath }
        let { layout = baseLayout } = options;
        if (layout !== baseLayout && (useCache || isStatic)) {
            layout = getLayoutPath(layout);
            !ejsCache.has(layout) && ejsCache.set(layout, ejs.compile(fs.readFileSync(baseLayout).toString(), ejsOptions))
        }
        var err = null
        // three cache strategies :-
        // 1. `isStatic` (for prodcution mode) : when a page dont't need any dynamic data like db search result
        // 2. `useCache` (for production mode) : when a page needs dynamically loaded data in `options`
        // 3. `none`     (for dev mode)        : recompile the whole template on every request
        try {

            if (options.isStatic) {
                if (ejsCache.has(filepath)) return callback(null, ejsCache.get(filepath));
                if (!ejsCache.has(filepath)) ejsCache.set(filepath, ejsCache.get(layout)(renderOpts))
                rendered = ejsCache.get(filepath);
            }
            else if (useCache) {
                rendered = ejsCache.get(layout)(renderOpts)
            }
            else {
                rendered = ejs.render(fs.readFileSync(layout).toString(), renderOpts, ejsOptions);
            }
        } catch (e) {
            err = e;
            console.log(err);
        }

        callback(err, rendered);
    }
    return renderer;
}

module.exports = {
    engine
}
