const { join : j } = require("path");
const { path : _ } = module; 
const e = file => j(_, file);

// used for SPA routing
module.exports = {
	layout : e( "layout.ejs"),
	views : {
		"main" : e("main.ejs"),
		//"#side-panel-body" : e("_ui/spi.ejs")
	},
	data : {
		title : 'Apps',
		"[name=description]" : 'Cool webapps hub',
		"#mainHeading" : "Apps"
	}
} 