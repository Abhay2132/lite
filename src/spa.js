import {log,$, $$} from "./hlpr.js"

const base = window.base || ""
const dp = new DOMParser();

function attachNavigator(a, cb){
  a.addEventListener("click",async e =>{
    e.preventDefault();
    let a = e.target;
    while(1){
      if(a.tagName.toLowerCase() == "a") break;
      a = a.parentNode;
    }
    let href = a.getAttribute("href")
    let data = await (await fetch(`${base}/_spa${href}_.json`)).json();
    // log({data});
    let {error=false, html="", css="", js=""} = data;
    if(error) return cb(error, void log(error));
    let view = dp.parseFromString(html, "text/html")

    for(let c of $$('main > *')){
      c.parentNode.removeChild(c);
    }
    $('main').appendChild(view.documentElement);

    cb(error, {e,data})
  }, false) 
}

export function init (cb){
  $$('[spa-link]').forEach(a=>attachNavigator(a,cb));
}
