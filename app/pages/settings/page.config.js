const { path : _ } = module;
const {join: j} = require('path')
  
module.exports = {
  views : {
    'main': j(_, 'main.ejs')
  }
}