import {init} from "./spa.js";
import {$, $$} from "./hlpr.js"

init((error, {e,data})=>{
  if(error) return console.error(error);
  let a = e.target;
  while(1){
    if(a.tagName.toLowerCase() == "a") break;
    a = a.parentNode;
  }
  if(a.className !== "side-panel-item-a") return;

  $('a.side-panel-item-a[active=true]').setAttribute("active", "false");
  a.setAttribute("active", 'true')
}); 

