import fs from 'fs';
import { createFolder } from './helpers.js';

/**
 * 
 * @param { String } filename 
 * @param { String } path 
 * @param { Object } data 
 * @param { Object } options 
 * @returns 
 */
export const handleHtaccess = (filename, path, data, options = { logs: false }) => {
	// Replace double breaks
	let output = data.replace(/\n\n/g, '\n');
	// Convert to array
	output = output.split(/\n/g)
	// Remove empty records
		.filter( rec => rec !== '')
	// Handle array's format
		.map( line => new Record(line).output );

	// Object for final output
	let outputObj = {};

	let i = 0;
	objStart: while (i < output.length) {
		let el = output[i];

		// Skip unused records
		if (el.alias === 'On') {
			i++;
			continue objStart;
		}

		if (el.type === 'DirectoryIndex') {
			outputObj['index'] = { type: 'RewriteRule', alias: 'index', file: el.alias };
			outputObj['index/'] = { type: 'RewriteRule', alias: 'index', file: el.alias };

			i++;
			continue objStart;
		}

		// Remove .htaccess special symbols
		el.alias = el.alias.replace(/\^|\$/g, '');

		// Save by page name as a key
		outputObj[el.alias] = { type: el.type, file: el.file };

		i++;
	}

	// Stringify object for writing to file
	let JSONtoSave = JSON.stringify(outputObj, null, 2);
    
	// Create folder if necessary
	if (path !== '') createFolder(path, { logs: options.logs });

	// Add '/' at the end of path string if necessary
	if (path.charAt(path.length - 1) !== '/') path += '/';

	// Add '.json' format to filename if necessary
	if (!filename.includes('.json')) filename += '.json';

	// Save result to file
	fs.writeFile(path + filename, JSONtoSave, (result, err) => {
		if (options.logs) console.log('🔗 Route JSON has been created');
		if (err && options.logs) console.log(err);
	});

	return outputObj;

	function Record (line) {
		let arr = line.split(' ');

		this.output = {
			type: arr[0],
			alias: arr[1],
			file: (arr[2]) ? arr[2] : null
		};
	} 
};