import { log, $, $$ } from "./hlpr.js"
import _history from './history.js';

const normalizeURL = (url)=> (url[0] == '/' && '/')+url.split("/").filter(Boolean).join('/')
const ef = () => { }
const base = window.base || ""
const href2url = (href) => normalizeURL(`${base}/_spa/${href.startsWith(base) ? href.replaceAll(base ,'') : href }_.json`);//[base, "_spa", href + "_.json"].map(i => i.replace(/[\/]/g, '')).filter(Boolean).join("/");
const pages = new Map();

async function Navigate(o, signal) {
	const { href, outlet, onerror, onstart, onappend, pop = false, reInit = ef } = o;
	onstart();
	let url = href2url(href);
	if (!pages.has(url)) pages.set(url, await (await fetch(url)).json())
	if(signal?.terminate) return;
	var data = pages.get(url);
	let { error = false, html = "", css = "", js = "" } = data;
	if (error) onerror(error, void console.error(error));
	outlet.innerHTML = html;
	o.onappend(error)
	reInit();
}

/* -------------------------------Extract Routes for <a> tag------------------------------------------ */
function ExtractRoutes(a) {
	if (a.getAttribute('spa-attached')) return;
	a.setAttribute('spa-attached', true);

	while (1) {
		if (a.tagName.toLowerCase() == "a") break;
		a = a.parentNode;
	}
	let href = a.getAttribute("href")
	Router.routes.add(normalizeURL(href))

	a.addEventListener("click", async e => {
		e.preventDefault();
		if(matchURL(href, location.pathname)) return;
		_history.push(href);

	}, false)
}

const matchURL = (a,b) => normalizeURL(a) === normalizeURL(b)

// ----------------------------------------< ROUTER >------------------------------------------------------
const Router = {
	attach: ef,
	routes: new Set(),
	navigate({type=false}) {
		if(!(type == 'push' || type == 'pop')) return;
		const signal = {terminate :false};
		let pathname = normalizeURL(location.pathname)
		if (!this.routes.has(pathname)) return console.log(Router.routes, location.pathname)
		Navigate({ ...this.o, href: pathname.slice(base.length), reInit: ()=>init(this.o)}, signal)

		return ()=>{signal.terminate=true}
	},
	o:{}
}

_history.listen((e) => Router.navigate(e))

/* `init` makes the initial setups like extracting routes from <a> tags 
and setup `Router`

@return <void>
@params {
	outlet <HTMLElement>,
	onstart, onappend, onerror <function> 
} */
export function init(o) {
	const { outlet = false } = o;

	if (!outlet) throw new Error(`outlet is not defined`)
	$$('[spa-link]').forEach(ExtractRoutes);

	// The Following code gonna run once only
	if (init.inited) return;
	Router.o = o
	init.inited = true;
}

(async ()=>{
	let url = href2url(location.pathname.slice(base.length))
	if (!pages.has(url)) pages.set(url, await (await fetch(url)).json())
})();