const { log } = require("console");
const ejs = require("ejs");
const fs = require("fs");
const { minify } = require("html-minifier-terser");
const path = require("path");

const { mode, j, r, viewDir: defaultViewDir, pagesDir } = require("./hlpr");
const { injectBase } = require("./html_injector");

const ejsCache = new Map();

const keywords = {
  "(": ")",
  '"': '"',
  "'": "'",
  "`": "`",
};

function findKey(value) {
  for (let key in keywords) {
    if (value == keywords[value]) return key;
  }
}

function extractArgument(str) {
  let arg = "";

  const keywordStack = [];
  for (let i = str.indexOf("(") + 1; i < str.length; i++) {
    let char = str[i];
    if (keywordStack.length == 0 && (char == ")" || char == ",")) break;

    if (str[i - 1] !== "\\") {
      if (keywordStack.at(-1) === char) keywordStack.pop();
      else if (keywords.hasOwnProperty(char)) {
        keywordStack.push(keywords[char]);
      }
    }
    arg += char;
  }
  if (keywordStack.length > 0)
    throw new Error(
      `not all keyword are closed \nKeyword stack : ${JSON.stringify(
        keywordStack
      )}\n` +
        `\n${str}\n` +
        " ".repeat(str.lastIndexOf(findKey(keywordStack.at(-1)))) +
        "^"
    );
  return arg.trim();
}

/**
 * extract file name from the source string
 * ('./_ui/card.ejs') -> ./ul/card.ejs
 * @param <STRING> str
 * @return <STRING>
 */
function extractFileName(str, locals) {
  const arg = extractArgument(str);
  if (!locals) return arg;
  const fun = new Function(
    "locals",
    "arg",
    `
		let __output = '';
		function __append(s) { if (s !== undefined && s !== null) __output += s }
		with(locals) __append(${arg})
		return __output;
	`
  );
  return fun.call(null, locals, arg);
}

/**
 * add types for `extractDeps` according to extension
 * @param {String} file
 * @return {file : <PATH> , type : <STRING> : (css|js)}
 */
function addType(file) {
  let type = "";
  let ext = file?.split(".")?.at(-1)?.split("?")?.at(0);
  switch (ext) {
    case "css":
    case "scss":
      type = "css";
      break;
    case "js":
    case "ts":
      type = "js";
  }

  return { file, type };
}

/**
 * View<.ejs> dependencies extractor
 * @param {string} view
 * @param {int} lvl
 * @param {Set} included
 * @return [{file : <PATH> , type : 'css' | 'js' }]
 */
function extractDeps({ data = {}, view, lvl = 1, included = new Set() }) {
  const regex1 = /(<%(#|-))\s*((required)|(include))(.*?)(%>)/g;
  let deps = new Set();
  if (included.has(view) || !fs.existsSync(view)) {
    return deps;
  }

  if (fs.statSync(view).isDirectory()) {
    console.error(
      new Error(
        `'${view}' is not file , but directory !\n call stack : ${JSON.stringify(
          [...included]
        )}`
      )
    );
    return [];
  }
  const source = fs.readFileSync(view).toString();
  included.add(view);
  const rootDir = view.split(path.sep).slice(0, -1).join(path.sep);

  while ((array1 = regex1.exec(source)) !== null) {
    const str = array1[0];
    const include = str.match(/<%-\s*include/g);
    const filename = extractFileName(str, data) || "";
    if (include) {
      const absIncludePath = path.isAbsolute(filename)
        ? filename
        : j(rootDir, filename);
      extractDeps({
        data,
        view: absIncludePath,
        lvl: lvl + 1,
        included,
      }).forEach((e) => deps.add(e));
      continue;
    }
    deps.add(filename);
  }

  if (lvl == 1) return Array.from(deps).map(addType);
  return deps;
}

function engine({ globalOptions = {}, ejsOptions = {} }) {
  return function renderer(filepath, options, callback) {
    const base = options?.base || globalOptions?.base || "";
    const renderOptions = {
      ...globalOptions,
      ...options,
      base,
      j,
      filepath,
      __: filepath.split("/").slice(0, -1).join("/"),
      extractDeps: (absPath) => {
        return extractDeps({ data: renderOptions, view: absPath });
      },
    };
    ejs.renderFile(
      filepath,
      renderOptions,
      { ...ejsOptions },
      async (err, str) => {
        let html = injectBase(str, base);
        callback(err, html);
      }
    );
  };
}

module.exports = {
  engine,
  extractDeps,
};
