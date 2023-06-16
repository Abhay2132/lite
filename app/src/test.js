import { getExt } from "./hlpr.js";

(async ()=>{
    const url = '/dist/crypto/india.great.html/d';
    let ext = getExt(url);
    console.log({ext})
})();