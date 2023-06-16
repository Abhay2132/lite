import { $$, removeBase, addBase, removeHOST, log, getExt, j, _host, $, normalizeURL, wait } from "./hlpr.js"
import { isSPAurl } from "./spa.js";

// parse the url to required fetch url e.g. http://localhost:3000/lite/about -> /_hash/about/index.html
const getTarget = url => {
  let u = new URL(url);
  let pathname = removeBase(u.pathname);
  let ext = getExt(pathname);
  if (pathname.endsWith("/") || !ext) pathname = j(pathname, "index.html")
  return addBase(normalizeURL(`/_hash/${pathname}.txt`))
}

async function checkHash({ url, hash }) {
  let target = getTarget(url)
  // console.table({ target, url, hash })
  var newHash = false;
  try {
    var response = await fetch(target)
    if (response.status >= 400) return console.log(response.status);
    newHash = await response.text();
  }
  catch (e) {
    console.error("udpate error : ", e)
  }
  let result = false;
  result = newHash !== hash;
  if (!newHash) result = false;

  // if(result == true) console.log(url, hash, newHash)
  return result;
}

async function fetchHash(url) {
  let target = getTarget(url)
  // console.table({ target, url, hash })
  var newHash = false;
  try {
    var response = await fetch(target)
    if (response.status >= 400) return console.log(response.status);
    newHash = await response.text();
  }
  catch (e) {
    console.error("fetchHash error : ", e, { url })
  }
  return newHash;
}

// update CACHES using hashes generated during build
export async function updateCache() {
  // console.log("updating cache !")
  let lazy = await caches.open('lazy');
  let keys = await lazy.keys();
  const outdatedFiles = [];
  // calculate and fetch hashes of files in 'lazy' cache
  for (let request of keys) {
    let { url } = request;
    let u = new URL(url);
    if (location.host !== u.host) continue;
    let response = await lazy.match(url);
    let ab = await response.arrayBuffer()
    let hash = (await digestMessage(ab)).slice(0, 6);
    let newHash = await fetchHash(url);
    if (newHash && hash !== newHash) outdatedFiles.push(url);
  }
  if(outdatedFiles.length) console.log(outdatedFiles);
  for (let oldFile of outdatedFiles) await lazy.delete(oldFile);
  if (outdatedFiles.filter(f => getExt(f) === "js" || isSPAurl(f) || !getExt(f)).length > 0) return location.reload();

  for (let oldFile of outdatedFiles) {
    oldFile = removeHOST(oldFile);
    let hrefs = $$(`[href="${oldFile}"]`);
    let srcs = $$(`[src='${oldFile}']`);
    for (let tag of srcs) {
      tag.setAttribute("src", "")
      await wait(0);
      tag.setAttribute('src', oldFile)
    }
    for (let tag of hrefs) {
      tag.setAttribute("href", "")
      await wait(0);
      tag.setAttribute('href', oldFile)
    }
  }
}

async function digestMessage(ab) {
  // const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-1", ab); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}