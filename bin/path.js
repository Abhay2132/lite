const { pathToRegexp, match, parse, compile } = require("path-to-regexp");
const { log } = console;

const keys = [];
const regexp = pathToRegexp("/user/:name/:id", keys)

const href = "/user/Abhay/ab21";
const a = match("/user/:name/:id")(href)
log({keys, regexp,a } )