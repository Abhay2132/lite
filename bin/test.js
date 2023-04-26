const argv = new Map();
process.argv.filter(Boolean).forEach(arg =>{
  let [key, val=true] = arg.split("=");
  argv.set(key, val);
})

console.log(argv.get('--base'));