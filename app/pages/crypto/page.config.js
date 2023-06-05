const { join : j } = require("path");
const { path : _ } = module; 
const e = file => j(_, file);

// used for SPA routing
module.exports = {
	layout : e( "layout.ejs"),
	views : {
		"main" : e("main.ejs"),
		//"#side-panel > div:nth-child(2)" : e("_ui/spi.ejs")
	}
} 