import { updateCache } from "./cacheUpdater.js";
import { init } from "./spa.js";
import { $, $$, log } from "./hlpr.js";
const { table: t } = console;
import { registerServiceWorker } from "./sw.js";

updateCache();
const base = window.base || "";

function normalizePath(url) {
	let path = url.startsWith("http") ? new URL(url)?.pathname : url;
	return (
		(path[0] === "/" ? "/" : "") + path.split("/").filter(Boolean).join("/")
	);
}

const onappend = (error) => {
	document.body.setAttribute("spa", "loaded");
	if (error) return console.error(error);

	$("#hmbgr-input").checked = false;
	let i = paths.indexOf(normalizePath(location.pathname));
	if (i == -1) return;

	$("a.side-panel-item-a[active=true]")?.setAttribute("active", "false");
	$$("a.side-panel-item-a")[i].setAttribute("active", "true");
};

const onstart = () => document.body.setAttribute("spa", "loading");

init({ outlet: $("main"), onappend, onstart });

const paths = [];
$$("a.side-panel-item-a").forEach((i) => {
	paths.push(normalizePath(i.href));
});

registerServiceWorker();

const d = {};
window.addEventListener("scroll", (e) => {
	//log(document.scrollingElement.scrollTop);
});
