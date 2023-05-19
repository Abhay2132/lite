const { j, log, hash : { hash }, r, ls , appDir } = require("../lib");

let files = ls(appDir)
log({files});

hash(files)
.then(log)