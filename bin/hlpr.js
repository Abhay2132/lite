const { resolve: r, join: j } = require("path");
const fs = require("fs");

const lastWatch = {name:"", time:performance.now()}
function watcher (dirs, cb) {
	for (let dir of dirs) {
		fs.watch(dir, (e,f)=> {
			let fp = j(dir,f)
			if(e=='rename' && fs.existsSync(fp) && fs.statSync(fp).isDirectory())
				 return watcher([fp], cb)
				 
			if((lastWatch.name == f || lastWatch.type=="rename") && (performance.now()-lastWatch.time)<500) return;
			cb(e,fp)
			lastWatch.name = f; lastWatch.time=performance.now(); lastWatch.type = e;
		});
		let files = fs.readdirSync(dir);
		for (let file of files) {
			if (fs.statSync(j(dir, file)).isDirectory()) watcher([j(dir, file)], cb);
		}
	}
}

function makeFreshDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function ls(dir) {
  if (!fs.statSync(dir).isDirectory()) return [dir];
  let items = [];
  fs.readdirSync(dir)
    .forEach(item => {
      items = [...items, ...ls(j(dir, item))];
    })
  return items.filter(Boolean);
}

function injectBase (html, base){
	if(!base) return html 
  const regexp = /<[^>]*(src|href)(\s*=\s*)("|')\/[^>]*>/g;
  var newHTML = "";
  var cur = 0;
  
  while ((array1 = regexp.exec(html)) !== null) {
    let tag = html.slice(array1.index, regexp.lastIndex)
    let link = tag.match(/(src|href)(\s*=\s*)(("[^"]*")|('[^']*'))/g)[0].split('=')[1].trim().slice(1,-1);
    
    // if base already exists skip
    if(link.startsWith(base)) continue;

    //searches index of  (src|href) attribute
    let i = tag.search(/(src|href)/g)

    //search for index of quotes (' or ")
    let j = 1 + i + tag.slice(i).search(/("|')/);

    // extract and append the string from source to returning variable
    newHTML += html.slice(cur, array1.index + j) + base

    //  shifting the cur the last required tag position
    cur = array1.index + j
  }
  
  // condition , if no location found for `base` injection 
	newHTML += cur > 0 ? html.slice(cur) : html;
	let hi = newHTML.indexOf("<head>");
	
	if(hi > -1) newHTML = newHTML.slice(0,hi+6)
		+`<script>window.base='${base}'</script>`
		+ newHTML.slice(hi)
  return newHTML;
}

module.exports = {
  r,
  j,
  mode : process.env?.NODE_ENV?.toLowerCase() == "production" ? "pro" : "dev",
  log : console.log,
  watcher,
	ls,
	makeFreshDir,
	injectBase
}