const keywords = {
	"(": ")",
	'"': '"',
	"'": "'",
	"`": "`",
}

function findKey(value) {
	for (let key in keywords) {
		if (value == keywords[value]) return key;
	}
}

function extractArgument(str) {
	let arg = '';

	const keywordStack = [];
	for (let i = str.indexOf('(') + 1; i < str.length; i++) {
		let char = str[i];
		if (keywordStack.length == 0 && (char == ')' || char == ',')) break;

		if (str[i - 1] !== '\\') {
			if (keywordStack.at(-1) === char) keywordStack.pop()
			else if (keywords.hasOwnProperty(char)) {
				keywordStack.push(keywords[char]);
			}
		}
		arg += char;

	}
	if (keywordStack.length > 0) throw new Error(
		`not all keyword are closed \nKeyword stack : ${JSON.stringify(keywordStack)}\n` +
		`\n${str}\n` +
		" ".repeat(str.lastIndexOf(findKey(keywordStack.at(-1)))) + "^"
	)
	return arg.trim();
}

/**
 * extract file name from the source string
 * ('./_ui/card.ejs') -> ./ul/card.ejs
 * @param <STRING> str 
 * @returns <STRING>
 */
function extractFileName (str, locals){
	const arg = extractArgument(str);
	if(!locals) return arg;
	const fun = new Function('locals', 'arg', `
		let __output = '';
		function __append(s) { if (s !== undefined && s !== null) __output += s }
		with(locals) __append(${arg})
		return __output;
	`)
	return fun.call(null, locals, arg)
}

const locals = {
	j(...a){
		return a.join('/')
	},
	pagesDir : "/root/lite/app/pages",
	views : {
		main: "main.ejs"
	}
}
const ex1 = extractFileName('<%# required("/sass/ui/card1.css") %>', locals)
const ex2 = extractFileName('<%# include(views.main) %>', locals)
const ex3 = extractFileName('<%# include(j(pagesDir, views.main), {data}) %>', locals)
const ex4 = extractFileName('<%# include (views.main) %>', locals)

console.log({
	ex1,
	ex2,
	ex3,
	ex4
})