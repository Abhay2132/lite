const { createHash } = require("crypto");
const fs = require("fs");
const { ls, mode } = require("./hlpr");

const read = (file) => fs.createReadStream(file);

// @return Promsie -> <Object> { file : hash }
const hash = (files, len) =>
	new Promise((res) => {
		let out = {};
		let i = 0;
		for (let file of files) {
			if (!fs.existsSync(file)) return (i += 1);
			let _hash = createHash("sha1");
			read(file)
				.on("data", (d) => _hash.update(d))
				.on("end", () => {
					out[file] = len
						? _hash.digest("hex").slice(0, len)
						: _hash.digest("hex");
					i += 1;
					if (i == files.length) res(out);
				});
		}
	});

const sw_hash = (sw, dir, len = 6) =>
	new Promise((res) => {
		const files = ls(dir);
		hash(files, len).then((data) => {
			let new_data = {};
			for (let file in data) {
				new_data[file.slice(dir.length)] = data[file]; //.slice(0,len);
			}
			const new_sw =
				`const _hashes = JSON.parse(\`${JSON.stringify(new_data)}\`);` +
				"\n" +
				`${sw}`;
			res(new_sw);
		});
	});

/**
 * Generate a 6 letter file hash with sha1 algo
 * used in build time and dev mode so SYNC FS used
 * Condition : NOT USED IN PRODUCTION RUNTIME
 * @param {*} file 
 * @returns <String(6)> hex
 */
const fileHash = file => {
	const hash = createHash('sha1');
	if(!fs.existsSync(file)) throw new Error(`fileHash Error : '${file}' does not exists !`);
	if(fs.statSync(file).isDirectory()) throw new Error(`fileHash Error : '${file}' is a directory, not a file !`);
	hash.update(fs.readFileSync(file));
	let hex = hash.digest('hex')
	return hex.slice(0, 6);
}

module.exports = { hash, fileHash, sw_hash };
