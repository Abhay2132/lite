const fs = require("fs");
const { j, log, injectBase, r } = require("./hlpr");
const { hrtime } = require("node:process");
const sass = require("sass");

const file = j(r(), "sass", "global.scss");
const index = fs.readFileSync(file).toString(); //+ "< href='/lite/india'>";
var time = [];
/*
for(let i=0; i < 1e5; i++){
	let t1 = performance.now();
	injectBase(index, "/lite")
	let t2 = performance.now();
	time.push(t2-t1);
}

//time = [[1,2],[1,2],[1,2],[1,2],]
//time = time.map(([t1,t2]) => t2-t1)
let avg =( time.reduce((a,b) => a+b, 0))/time.length;
let min = Math.min(...time)
let max = Math.max(...time)
 log ({avg, min, max})
 */

let { css } = sass.compile(file, { style: "compressed" });
log(sass.compile(file, { style: "compressed" }).css);
