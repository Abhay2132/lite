function hello (a) {
	console.log(a, "Hello");
}

setImmediate(() => hello("setImmediate"))
setTimeout(() => hello("setTimeout"), 10)