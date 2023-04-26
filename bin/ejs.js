const ejs = require("ejs");
const fs = require("fs");
const { resolve: r, join: j } = require("path")

const ejsCache = new Map();
const getLayoutPath = name => j(r(), "pages", "_layouts", name + (name.endsWith(".ejs") ? "" : ".ejs"));

function engine(eopts) {
    const {
        baseLayout = j(r(), "views", ""),
        base = '',
        ejsOptions = {},
        globalOptions = {},
        useCache = process.env?.NODE_ENV?.toLowerCase() === "production"
    } = eopts;

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
        // three cache modes :-
        // 1. `isStatic` (works in production only): render pages from build dir (/dist)
        // 2. `useCache` : render pages dynamically with data from async function `loader` in pages.config.js
        // 3. `none` (for dev mode) : recompile the whole template on every request
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
