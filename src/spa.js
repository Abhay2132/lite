import { log, $, $$ } from "./hlpr.js"

const ef = () => { }
const base = window.base || ""
const href2url = (href) => "/" + [base, "_spa", href + "_.json"].map(i => i.replace(/[\/]/g, '')).filter(Boolean).join("/");
const pages = new Map();
const normalizeURL = (url)=> (url[0] == '/' && '/')+url.split("/").filter(Boolean).join('/')

export const _history = {
	e: new Map(),
	states: [],
	pos: 0,
	replace(url = "", state = {}) {
		// this.states[Math.max(this.states.length, 1) - 1] = { url, state };
		this.states[this.pos] = { url, state }
		history.replaceState({ pos: this.pos }, null, url);
		this.emit('replace')
	},
	push(url = "", state = {}) {
		if (this.pos < this.states.length - 1) this.states = this.states.slice(0, pos);
		// this.states.push({ url, state });
		this.pos += 1;
		this.states[this.pos] = { url, state }
		history.pushState({ pos: this.pos }, null, url)
		this.emit('push')
	},
	on(names = false, handler = false) {
		if (!(names && handler)) throw new Error(`Either name or Handler is missing in \`on\` method`)
		names.split(" ").forEach(name => {
			if (!this.e.has(name)) this.e.set(name, new Map())
			let e = this.e.get(name)

			for (let [key, val] of e) if (Object.is(val.handler, handler)) return;
			e.set(e.size, { cleanup: false, handler })
		})
	},
	emit(name, data) {
		// log('emit', name)
		if (!this.e.has(name)) return;
		this.e.get(name).forEach(i => {
			if (i.cleanup) cleanup();
			let a = i.handler(this, data);
			if (typeof a == "function") i.cleanup = a;
		});
	},
	remove(name, handler = false) {
		if (!this.e.has(name)) return;
		if (!handler) this.e.delete(name);
		let e = this.e.get(name)
		e.forEach((i, k) => {
			if (i.handler != handler) return;
			e.delete(k);
		})
	},
	get state() {
		return this.states.at(-1)
	}
}

window.addEventListener('popstate', (e) => _history.emit('pop', e));

async function Navigate(o) {
	const { href, outlet, onerror, onstart, onappend, pop = false, reInit = ef } = o;
	onstart();
	let url = href2url(href);
	if (!pages.has(url)) pages.set(url, await (await fetch(url)).json())
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
	Router.routes.add(normalizeURL(base + href))

	a.addEventListener("click", async e => {
		e.preventDefault();
		_history.push(base + href);

	}, false)
}

const Router = {
	attach: ef,
	routes: new Set(),
	navigate() {
		let pathname = normalizeURL(location.pathname)
		if (!this.routes.has(pathname)) return console.log(Router.routes, location.pathname)
		Navigate({ ...this.o, href: pathname.slice(base.length), reInit: ()=>init(this.o)})
	},
	o:{}
}

_history.on("push pop", (...a) => Router.navigate(...a))

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
	let url = location.pathname;
	if (!pages.has(url)) pages.set(url, await (await fetch(url)).json())
})();