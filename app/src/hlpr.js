const base = window.base || "";

export const wait = (n) => new Promise((r) => setTimeout(r, n || 0));
export const log = console.log;
export const $ = (q) => document.querySelector(q);
export const $$ = (q) => document.querySelectorAll(q);
export const normalizeURL = (url) =>
	(url[0] == "/" ? "/" : "") + url.split("/").filter(Boolean).join("/");
export const getExt = file => {
	let basename = file.split("/").at(-1);
	let name = basename.split("?")[0] || "";
	if(name.indexOf('.') < 0) return false;
	return name.split(".").at(-1);
	// return file?.split("/")?.at(-1)?.split('.')?.at(-1)?.split("?")?.at(0)
}
export const removeHOST = url => url.startsWith(_host) ? url.slice(_host.length): url;
export const _host = location.href.slice(0, location.href.length - location.pathname.length);
export const addBase = url => url[0] == '/' ? (url.startsWith(base) ? url : base + url) : url;
export const removeBase = url => url.startsWith(base) ? url.slice(base.length) : url;
export const j = (...paths) => paths.map(normalizeURL).join("/");