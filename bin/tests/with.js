const locals = {
	a : "Abhay",
	say : function ( name ) { return ("say "+ name) }
}
const locals2 = {
	a : "Abhay2",
	say : function ( name ) { return ("2. say " +name) }
}

console.log(locals)
const code = `
let result = "";
const __append = str => ( result += str); 
const fs = require("fs")
with(locals){
	console.log(path);
	__append(say(a));
	__append(say("ABHAY"));
	a = "India";
	__append(say(a));
	__append(fs.readFileSync(path).toString());
}
return result;`
 let f = new Function ( "locals", "require", "path", code)
 const r1 = f.call(null, locals, require, module.path);
const r2 = f.call(null, locals2, require, module.path);

console.log(locals, { r1, r2})