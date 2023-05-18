export  async function registerServiceWorker () {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
