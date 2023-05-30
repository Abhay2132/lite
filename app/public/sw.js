const isDev = location.hostname == "localhost";
const { log } = console;
const base = typeof _base !== "undefined" ? _base : "";

//log(location.hostname, "Abahy")

self.addEventListener("install", (e) => {
	self.skipWaiting();
});

self.addEventListener("activate", (e) => {
	e.waitUntil(
		caches.open("lazy").then((c) => c.add(base + "/404")),
		() => self.clients.claim()
	);
});

self.addEventListener("fetch", (e) => {
	if (isDev) return false

	const { pathname } = new URL(e.request.url);
	const valid = isValid(pathname);
	if (!valid) return false;

	return e.respondWith(getRes(e));
});

async function getRes(e) {
	const cr = await caches.match(e.request); // cached response
	if (cr) {
		let { body, status, statusText, headers } = cr;
		let res = new Response(body, { status, statusText, headers });
		return res;
	}

	if (e.request.method.toLowerCase() !== "get") return false;
	var res = false;
	var err = false;
	try {
		res = await fetch(e.request.url);
	} catch (e) {
		err = e;
	}
	if (err) return new Response("", { status: 500, statusText: "offline" });

	const clone = await res.clone();
	const cache = await caches.open("lazy");
	await cache.put(e.request, clone);

	return res;
}

function isValid(url) {
	if (url.startsWith(base)) url = url.slice(base.length + 1);
	if (url.match(/^(api)|(_hash)/g)) return false;
	return true;
}
