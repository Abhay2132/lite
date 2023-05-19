const { base = "" } = window;

const normalizeURL = (url) =>
	(url[0] == "/" ? "/" : "") + url.split("/").filter(Boolean).join("/");
console.log("cache updater : 1.0.4");
function _json(str) {
	let json = str;
	try {
		json = JSON.parse(str);
	} catch (e) {}
	return json;
}

async function update(cache, file) {
	console.log("updating", file);

	await cache.delete(file);
	await cache.add(file);

	return true;
}

export function updateCache() {
	console.log("checking for cache updates !");
	fetch(base + "/_hashes.json")
		.then((res) => res.text())
		.then(_json)
		.then(async (hashes) => {
			const cache = await caches.open("lazy");
			const localHashes = _json(localStorage.getItem("hashes"));

			let reloadRequired = false;
			if (localHashes)
				for (let req of await cache.keys()) {
					let url = normalizeURL(req.url.slice(location.origin.length));
					//console.log(url," : ", hashes[url] ,"!==", localHashes[url])
					if (!hashes[url]) continue;
					if (hashes[url] !== localHashes[url])
						reloadRequired = await update(
							cache,
							url.startsWith(base) ? url : base.concat(url)
						);
				}
			if (reloadRequired)
				console.log("reloading page !") || location.assign(location.href);
			else console.log("cache is up-to-date :)");
			localStorage.setItem("hashes", JSON.stringify(hashes));
		})
		.catch((err) => console.log("update Cache Error \n :", err));
}