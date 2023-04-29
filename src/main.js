import {init, _history} from "./spa.js";
import {$, $$, log} from "./hlpr.js"

const base = window.base || "";
window._history = _history;

const onappend = (error)=>{
  document.body.setAttribute("spa", "loaded");
  if(error) return console.error(error);
  
  let i = paths.indexOf(location.pathname);
  if(i == -1) return;

  $('a.side-panel-item-a[active=true]').setAttribute("active", "false");
  $$('a.side-panel-item-a')[i].setAttribute("active", 'true')

  $('#hmbgr-input').checked = false;
}

const onstart = ()=> document.body.setAttribute("spa", "loading");

init({outlet: $('main'), onappend, onstart}); 

const paths = ['/', '/about', '/settings']