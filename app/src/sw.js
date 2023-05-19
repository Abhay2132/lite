const { base = "" } = window;
import { updateCache } from "./cache.js";
export async function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.register(base + "/sw.js", {
				scope: base + "/",
			})
			.then((registration) => {
				registration
					.update()
					.then(updateCache)
					.catch(() => console.log("sw update failed , maybe you are offline"));
			})
			.catch(console.error);
	}
}
