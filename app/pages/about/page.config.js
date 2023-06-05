const { join : j } = require("path");
// current dir /pages/about
const { path : _ } = module; 

// used for SPA routing
module.exports = {
	layout : j(_, "..", 'layout.ejs'),
	views : {
		"main" : j(_,"main.ejs"),
		//"#side-panel > div:nth-child(2)" : e("_ui/spi.ejs")
	}
} 