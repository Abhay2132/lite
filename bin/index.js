const http = require("http");
const server = http.createServer(require("./app"));
const port = process.env.PORT || 3000;
const {networkInterfaces} = require("os");
const { log , table } = console

server.listen(port, async () => {
	console.clear()
	let ni = networkInterfaces(),
		env = (process.env.NODE_ENV||"").toLowerCase() == "production" ? "pro" : "dev"
	
    let ms = 15;
    log("Server is onine xD");
    //log("  MODE %s : %s", " ".repeat(ms - 4),  env.toUpperCase());
    const networks = {env}
    for (let key in ni)
      ni[key].forEach((item, i) => {
        if (item.family == "IPv4"){
        	networks[key] = "http://"+item.address+":"+port
          	//log("  %s %s : http://%s:%i",key," ".repeat(ms - key.length),item.address,port);
          }
      });
      table(networks);
});
