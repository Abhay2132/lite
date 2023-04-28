const fs = require("fs")
const { j, log, r } = require("./hlpr")

const index = fs.readFileSync(j(r(), "dist", 'index.html')).toString()+ "< href='/lite/india'>";

function injectBase (html, base){
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
  if(cur >0) newHTML += html.slice(cur);

  return newHTML || html;
}

log(injectBase(index, "/lite"))