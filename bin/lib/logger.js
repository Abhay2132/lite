module.exports = (req, res, next) => {
	let it = performance.now();
	let l = () => {
		let {statusCode} = res
		let {method} = req;
		let sc_color, method_color;
		
		if(statusCode >= 200) sc_color = chalk.black.bgGreen(statusCode);
		if(statusCode >= 300) sc_color = chalk.black.bgYellow(statusCode);
		if(statusCode >= 400) sc_color = chalk.white.bgMagenta(statusCode);
		if(statusCode >= 500) sc_color = chalk.white.bgRed(statusCode);
		
		if(method == "DELETE") method_color = chalk.red(method)
		else if(method == "POST") method_color = chalk.yellow(method)
		else method_color = chalk.green(method)
		let s = " ";
		
		let time = (performance.now() - it).toFixed(1) + " ms"
		if(parseInt(time) > 1000) time = (parseInt(time)*(0.001)).toFixed(1)+" sec"
		console.log(
			sc_color, 
			method_color,
			" ".repeat(6 - method.length), 
			time,
			" ".repeat(9-time.length),  
			req.url, 
		)
		}
	res.on("finish", l);
	next();
}