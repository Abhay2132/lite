import { log, $, $$ } from "./hlpr.js"

const base = window.base || ""
const href2url = (href) => "/"+[base, "_spa", href+"_.json"].map(i => i.replace(/[\/]/g,'')).filter(Boolean).join("/");
const dp = new DOMParser();
const pages = new Map();
const href2route = href => href.startsWith(base) ? href : base+href;

export const _history = {
	e: new Map(),
	states: [],
	pos: 0,
	replace(url = "", state = {}) {
		// this.states[Math.max(this.states.length, 1) - 1] = { url, state };
		this.states[this.pos] = {url, state}
		history.replaceState({pos: this.pos}, null, url);
		this.emit('replace')
	},
	push(url = "", state = {}) {
		if(this.pos < this.states.length - 1) this.states = this.states.slice(0, pos);
		// this.states.push({ url, state });
		this.pos += 1;
		this.states[this.pos] = {url, state}
		history.pushState({pos: this.pos}, null, url)
		this.emit('push')
	},
	on(name = false, handler = false) {
		if (!(name && handler)) throw new Error(`Either name or Handler is missing in \`on\` method`)
		if (!this.e.has(name)) this.e.set(name, new Map())
		let e = this.e.get(name)

		for (let [key, val] of e) if (Object.is(val.handler, handler)) return;
		e.set(e.size, { cleanup: false, handler })
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

async function navigate(o, reInit) {
	const { href, outlet, onerror, onstart, onappend, pop = false } = o;
	onstart();

	let url = href2url(href);
	log({url})
	if (!pages.has(url)) pages.set(url, await (await fetch(url)).json())
	var data = pages.get(url);

	let { error = false, html = "", css = "", js = "" } = data;
	if (error) onerror(error, void console.error(error));

	outlet.innerHTML = html;
	if (!pop) {
		_history.replace('', { href: location.pathname.slice(base.length) })
		_history.push(base + href, { href });
	}
	o.onappend(error)
	reInit(); // re attach the navigator to the new links in outlet
}

/* ---------------------------------------------------------------------------------------- */
function attachNavigator(a, o, cb) {
	if (a.getAttribute('spa-attached')) return;

	a.setAttribute('spa-attached', true);
	a.addEventListener("click", async e => {

		e.preventDefault();
		let a = e.target;
		while (1) {
			if (a.tagName.toLowerCase() == "a") break;
			a = a.parentNode;
		}
		let href = a.getAttribute("href")

		// log('before navigate',e)
		await navigate({ ...o, href }, cb)

	}, false)
}

const ef = () => { } // empty function 
var inited = false;
export function init(o) {
	const { outlet = false, onstart = ef, onappend = ef, onerror = console.error } = o

	if (!outlet) throw new Error(`outlet is not defined`)
	$$('[spa-link]').forEach(a => attachNavigator(a, o, ()=> init(o)));

	if (inited) return;

	_history.on('pop', function (me,e) {
		// me.states.pop();
		console.log(e.type, history)
		let {state:{pos}} = history;
		if(typeof pos != 'number') return console.log(history.state);
		if(_history.states.length ==	0) return;
		
		let { state: { href }} = _history.states[pos];
		// console.log('_history pop event fired ', me.state)
		navigate({ ...o, href, pop: true }, ()=>init(o));
	})

	inited = true;
}
