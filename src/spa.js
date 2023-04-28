import {log, $$} from "./hlpr.js"

const base = window.base || ""

function attachNavigator(a){
  a.addEventListener("click", e =>{
    log({e})
    log(e.taget.getAttribute('href'))
    fetch(base+'/spa/'+e.target.href)
    .then(log)
  }, false) 
}

export function init (){
  $$('[spa-link]').forEach(attachNavigator);
}
