/*
const OLD = {
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
*/

class _History {
	#_history = window.history;
	#listeners = [];
	#states = []
	emit(data) {
		for (let i = 0; i < this.#listeners.length; i++) {
			let { cleanup = false, handler } = this.#listeners[i]
			if (cleanup) cleanup();
			let newCleanup = handler(data);
			if (typeof newCleanup == 'function') this.#listeners[i].cleanup = newCleanup;
		}
	}

	constructor() { }

	push(url='', state={}){
		this.#_history.pushState(state, null , url);
		this.emit({type: 'push', state});
		this.#states.push(state);
		return this;
	}

	replace(url='', state={}){
		this.#_history.replaceState(state, null , url);
		this.emit({type: 'replace', state});
		this.#states[this.#states.length-1] = state;
		return this;
	}

	listen(cb){
		if(typeof cb == 'function')
			this.#listeners.push({cleanup:false, handler : cb});
	}

	remove (cb){
		if(!cb) return;
		for(let i=0;i< this.#listeners.length; i++){
			if(Object.is(this.#listeners[i], cb)) return this.#listeners.splice(i, 1);
		}
	}

	removeAll(){this.#listeners = []}

	pop(e={}){
		this.#states.pop();
		this.emit({type: 'pop', state: this.#states.at(-1), e});
		return this;
	}

	get state (){
		return this.#states.at(-1);
	}
}

const _history = new _History();
window.addEventListener('popstate', (e) => _history.pop(e));

export default _history;