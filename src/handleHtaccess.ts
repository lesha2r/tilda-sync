import fs from 'fs';
import utils from './utils.js';

const ALIAS_ON = 'On';
const TYPE_DIRECTORY_INDEX = 'DirectoryIndex';
const TYPE_REWRITE_RULE = 'RewriteRule';

type TRoute = {
	type: string;
	alias: string;
	file: string | null;
}

const parseLine = (line: string): TRoute => {
	let arr = line.split(' ');

	return {
		type: arr[0],
		alias: arr[1],
		file: arr[2] ? arr[2] : null
	};
}

export const handleHtaccess = (filename: string, path: string, data: string, options = { logs: false }) => {
	// Parsee htaccess file and prepare it
	const output = data
		.replace(/\n\n/g, '\n') // or .split(/\n+/g)
		.split(/\n/g)
		.filter(rec => rec !== '')
		.map(rec => parseLine(rec));

	const outputObj: {[key: string]: TRoute } = {};

	let i = 0;
	objStart: while (i < output.length) {
		let el = output[i];

		// Skip unused records
		if (el.alias === ALIAS_ON) {
			i++;
			continue objStart;
		}

		if (el.type === TYPE_DIRECTORY_INDEX) {
			outputObj['index'] = { type: TYPE_REWRITE_RULE, alias: 'index', file: el.alias };
			outputObj['index/'] = { type: TYPE_REWRITE_RULE, alias: 'index', file: el.alias };

			i++;
			continue objStart;
		}

		// Remove .htaccess special symbols
		el.alias = el.alias.replace(/\^|\$/g, '');

		// Save by page name as a key
		outputObj[el.alias] = { type: el.type, alias: el.alias, file: el.file };

		i++;
	}

	// Stringify object for writing to file
	const JSONtoSave = JSON.stringify(outputObj, null, 2);
    
	// Create folder if necessary
	if (path !== '') utils.createFolder(path, { logs: options.logs });

	// Add '/' at the end of path string if necessary
	if (path.charAt(path.length - 1) !== '/') path += '/';

	// Add '.json' format to filename if necessary
	if (!filename.includes('.json')) filename += '.json';

	// Save result to file
	fs.writeFile(path + filename, JSONtoSave, (err) => {
		if (err) {
			if (options.logs) console.error('Error writing file:', err);
			throw new Error('Failed to write JSON file');
		}

		if (options.logs) console.log('🔗 Route JSON has been created');
	});

	return outputObj;
};