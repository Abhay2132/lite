const fs = require("fs/promises")

fs.readFile(__filename)
.then(buffer => console.log(buffer.toString()))