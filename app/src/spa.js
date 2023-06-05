import { log, $$, $, normalizeURL } from "./hlpr.js";
import _history from "./history.js";

const ef = () => {};
const base = window.base || "";
const href2url = (href) => {
	let path = normalizeURL(
		`${href.startsWith(base) ? href.slice(base.length) : href}`
	);
	// if(path.at(-1) === "/") path = path.slice(0,-1);
	let url = normalizeURL(`${base}/_spa/${path}_.json`);
	return url;
};
const pages = new Map();
const styleCache = new Map();
const scriptCache = new Map();

const addScript = src => new Promise( async (res, rej) => {
	let oldTag = $(`srcipt[src="${src}"]`);
	oldTag && oldTag.remove();
	let script = document.createElement("script")
	script.setAttribute("type", "module");
	script.setAttribute("data-src", src);
	if(!scriptCache.has(src)) {
		let response = await fetch(src)
		if(response.status >= 400) return res();
		log(response.status)
		let text = await response.text()
		scriptCache.set(src, text);
	}
	let js = scriptCache.get(src)
	script.innerHTML = js;
	document.body.appendChild(script);
	return res();
});

const styler = {
	async add ( href ) {
		let style = document.createElement("style");
		style.setAttribute("data-href", href);
		let error = false;
		var css = ''
		if (!styleCache.has(href)){
		try {
			css = await (await fetch(href)).text();
			styleCache.set(href, css);
		} catch(e){
			error = e;
			console.error(e)
		}
		}
		if(error) return
		$("head").appendChild(style)
		style.innerHTML = styleCache.get(href);
	},
	has ( href ) {
		return !! $(`style[data-href="${href}"]`)
	}
}
const style = document.createElement("style");
$("head").appendChild(style);

const _fetch = (url) =>
	new Promise((r) =>
		fetch(url)
			.then((d) => d.text())
			.then(r)
			.catch(() => r(""))
	);
const _json = (txt) => {
	let json = {};
	try {
		json = JSON.parse(txt);
	} catch (err) {}
	return json;
};

/**
 * 
 * @param {*} o 
 * @param {*} signal 
 * @returns void
 */
async function Navigate(o, signal) {
	//const { href, outlet, onerror, onstart, onappend, pop = false, reInit = ef } = o;
	o.onstart();
	let url = href2url(o.href);
	if (!pages.has(url)) {
		let data_txt = await _fetch(url);
		if (!data_txt)
			return location.assign(
				o.href.startsWith(base) ? o.href : base.concat(o.href)
			);
		pages.set(url, _json(data_txt));
	}
	if (signal?.terminate) return;
	var data = pages.get(url);
	let { error = false, html = {}, css = [], js = [] } = data;
	if (error) onerror(error, void console.error(error));
	for(let url of css) {
		if(!styler.has(url)) await styler.add(url);
	}
	
	// if (html) o.outlet.innerHTML = html;
	for(let query in html){
		let out = document.querySelector(query)
		if(out) out.innerHTML = html[query]
	}
	
	for(let src of js) {
		try{await addScript(src);}
		catch(e){ console.error(e) } 
	}
	o.onappend(error);
	//log({css, js});
	o.reInit();
}

/* -------------------------------Extract Routes for <a> tag------------------------------------------ */
function ExtractRoutes(a) {
	if (a.getAttribute("spa-attached")) return;
	a.setAttribute("spa-attached", true);
	const tru = true;
	while (a.tagName.toLowerCase() !== "a") {
		//if (a.tagName.toLowerCase() == "a") break;
		a = a.parentNode;
	}
	let href = a.getAttribute("href");
	if (href.at(-1) !== "/") href; // += "/";
	Router.routes.add(normalizeURL(href));

	a.addEventListener(
		"click",
		async (e) => {
			//log("clicked ", e.target);
			e.preventDefault();
			if (matchURL(href, location.pathname)) return;
			_history.push(href);
		},
		false
	);
}

const matchURL = (a, b) => normalizeURL(a) === normalizeURL(b);

// ----------------------------------------< ROUTER >------------------------------------------------------
const Router = {
	attach: ef,
	routes: new Set(),
	navigate({ type = false }) {
		if (!(type == "push" || type == "pop")) return;
		const signal = { terminate: false };
		let pathname = normalizeURL(location.pathname);
		if (!this.routes.has(pathname))
			return console.log(Router.routes, location.pathname);
		Navigate(
			{
				...this.o,
				href: pathname.slice(base.length),
				reInit: () => init(this.o),
			},
			signal
		);

		return () => {
			signal.terminate = true;
		};
	},
	o: {},
};

_history.listen((e) => Router.navigate(e));

/* `init` makes the initial setups like extracting routes from <a> tags 
and setup `Router`

@return <void>
@params <Object> {
	outlet <HTMLElement>,
	onstart, onappend, onerror <function> 
} */
export function init(o) {
	const { outlet = false } = o;

	if (!outlet) throw new Error(`outlet is not defined`);
	$$("a[spa-link]").forEach(ExtractRoutes);

	// The Following code gonna run once only
	if (init.inited) return;
	Router.o = o;
	init.inited = true;
}

(async () => {
	let url = href2url(location.pathname.slice(base.length));
	if (!pages.has(url)) pages.set(url, await (await fetch(url)).json());
})();
