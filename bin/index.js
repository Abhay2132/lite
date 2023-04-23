const http = require("http")
const server = http.createServer(require("./app"));
const port = process.env.PORT || 3000;

server.listen(port, ()=>{
    console.log("Server started at : http://localhost:3000/");
})