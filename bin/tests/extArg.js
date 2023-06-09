function extractArgument(str) {
	let arg = '';
	const keywords = {
		"(": ")",
		'"': '"',
		"'": "'",
		"`": "`",
	}
	const keywordStack = [];
	let opened = false;
	for (let i = 0; i < str.length; i++) {
		let char = str[i];
		if (!opened && char == "("){
			opened = true;
			continue;
		}
		if (!opened) continue;
		if (keywordStack.length == 0 && (char == ')' || char == ',')) break;

		if (str[i - 1] !== '\\') {
			if (keywordStack.at(-1) === char) keywordStack.pop()
			else if (keywords.hasOwnProperty(char)) {
				keywordStack.push(keywords[char]);
			}
		}
		arg += char;

	}
	return arg.trim();
}

const source = 'include(j(pagesDir, "main.ejs") , {})';
const argument = extractArgument(source)
const ex1 = extractArgument('d;afj(\'indlje\')')
const ex2 = extractArgument('d;afj("indlje")')
const ex3 = extractArgument('d;afj(\'indlje\')')

console.log({ argument , ex1});