const argv = new Map();

process.argv.filter(Boolean).forEach(arg => {
  let [key, val = true] = arg.split("=");
  argv.set(key, val);
})
const base = argv.get("--base") || ""

module.exports = {
  base,
  ext: "ejs",
  host: argv.get("--host") || ""
}