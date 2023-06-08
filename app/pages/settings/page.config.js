const { path : _ } = module;
const {join: j} = require('path')
  
module.exports = {
  title : "Settings",
  
  views : {
    'main': j(_, 'main.ejs')
  }
}