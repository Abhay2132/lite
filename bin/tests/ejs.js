const ejs = require('ejs')
const {path: _} = module;

ejs.renderFile(_+'/view.ejs',{title: "HEHE"}, (err, data)=>{
  console.log(err, data)
})