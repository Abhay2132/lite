//ABOUT

const { join : j } = require("path");
const { path : _ } = module; 

// used for SPA routing
module.exports = {
	layout : j(_, "..", 'layout.ejs'),
	views : {
		"main" : j(_,"main.ejs"),
	},
	data : {
		title : "About",
		"#mainHeading" : "About"
	}
} 