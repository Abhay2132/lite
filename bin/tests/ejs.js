
const { ls, pagesDir, read } = require("../lib/hlpr");
const ejs = require('ejs')
const {path: _} = module;

if(process.argv[2] == "lint") {
	import("ejs-lint").then( e => {
	const lint = e.default;
	
	console.log(("_").repeat(process.stdout.columns))
	ls(pagesDir).filter(a => a.endsWith(".ejs"))
	.forEach( a => {
		console.log(typeof lint(read(a)) === "undefined" ? a+
			(" ").repeat(process.stdout.columns - a.length - 4)
			+ "ok" : "no")
	})
	})
} else 
ejs.renderFile(_+'/view.ejs',{title: "HEHE"}, (err, data)=>{
  console.log(err, data)
})