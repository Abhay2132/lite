const {ls, distDir, j, appDir, mkDir4File} = require('../lib/hlpr')
const {fileHash} = require('../lib/hash')
const {base} = require("../../pages.config")
const fs = require('fs')
const normalizeURL = (url) =>
	(url[0] == "/" ? "/" : "") + url.split("/").filter(Boolean).join("/");
// const 

module.exports = async function (){
	let files = ls(distDir)//.filter(file => file.slice(distDir.length)?.at(1) !== "_");
	// console.log({files});
	for(let file of files){
		let target = j(distDir, '_hash', file.slice(distDir.length)+".txt")
		mkDir4File(target);
		let hash = fileHash(file);
		fs.writeFileSync(target, hash)
	}
}

// async function() {
// 	console.log("Building _hashes.json");
// 	const hashes = await hash(ls(distDir), 6);
// 	let new_hashes = {};
// 	for (let file in hashes) {
// 		let new_name = base + file.slice(distDir.length);
// 		if (new_name.endsWith("index.html")) new_name = new_name.slice(0, -10);
// 		new_hashes[normalizeURL(new_name)] = hashes[file];
// 	}
// 	fs.writeFileSync(j(distDir, "_hashes.json"), JSON.stringify(new_hashes));
// }