(() => {
  // src/hlpr.js
  var wait = (n) => new Promise((r) => setTimeout(r, n || 0));

  // src/main.js
  (async () => {
    console.log("heelo");
    await wait(2e3);
    console.log(base, "INDIA");
  })();
})();
