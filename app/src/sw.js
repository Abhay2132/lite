export  async function registerServiceWorker () {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(base+"/sw.js", {
        scope: base+"/",
      });
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
