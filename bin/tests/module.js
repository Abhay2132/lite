const extractFileName = str => str
	?.match(/\((.*?)\)/g)
	?.at(0)
	// ?.match(/(('[^']*')|("[^"]*"))/g)
	// ?.at(0)
	// ?.slice(1, -1)
	// ?.trim()

const str = `include("j(_, views.main)")`;
console.log(extractFileName(str));