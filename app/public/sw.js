//const hashes = typeof _hashes !== "undefined" ? _hashes : {};
const isDev = typeof _isDev !== "undefined";
const { log } = console;
const base = "/lite";

self.addEventListener("install", (e) => {
	self.skipWaiting();
});

self.addEventListener("activate", (e) => {
	self.clients.claim();
});

self.addEventListener("fetch", (e) => {
	//if(isDev) return false;
	const { pathname } = new URL(e.request.url);
	const valid = isValid(pathname);
	if (!valid) return false;

	return e.respondWith(getRes(e));
});

async function getRes(e) {
	const cr = await caches.match(e.request); // cached response
	if (cr) return cr;

	if (e.request.method.toLowerCase() !== "get") return false;
	const res = await fetch(e.request.url);
	const clone = await res.clone();
	const cache = await caches.open("lazy");
	await cache.put(e.request, clone);
	return res;
}

function isValid(url) {
	if (url.startsWith(base)) url = url.slice(base.length);
	if (url.match(/^(\/api)|(\/_hash)/g)) return false;
	return true;
}
