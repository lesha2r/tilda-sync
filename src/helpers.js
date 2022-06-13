import fs from 'fs';
import https from 'https';

const fsp = fs.promises;

export const downloadFile = (file, folder, logs = false) => {
	return new Promise(( resolve, reject ) => {
		if (logs) console.log('💾 Downloading', file.from);

		if (folder.charAt(folder.length - 1) !== '/') folder += '/';

		https.get(file.from, async (result) => {
			let subfolder = (file.subfolder) ? file.subfolder : '';
			if (subfolder.charAt(subfolder.length - 1) !== '/') subfolder += '/';

			let path = folder + subfolder + file.to;

			let stream = fs.createWriteStream(path);
			result.pipe(stream)
				.on('error', (err) => {
					console.log('err result pipe'); // TODO: remove
					reject({ success: false, details: err.message });
					return;
				})
				.on('finish', () => {}); // TODO: Replace

			resolve({ success: true });
		}).on('error', err => {
			console.log('https get error'); // TODO: remove
			console.log(err);
		});
	});
};

export const addDelay = (ms) => {
	return new Promise((resolve) => {
		setTimeout( ()=> resolve(true), ms);
	});
};

export const createFolder = (folder, options = { logs: false }) => {
	return new Promise((resolve, reject ) => {
		folder = folder.replace('//', '/');
		fsp.mkdir(folder, { recursive: true })
			.then( () => { 
				if (options.logs) console.log('📂 Folder', folder, 'created');
				resolve(true);
			})
			.catch( err => {
				if (options.logs) console.log('📂 Error on folder creation:', folder,);
				reject(err);
			});
	});
};

export const filterDownloadList = (input, options = { logs: false }) => {
	let output = [];
    
	output = input.filter((elem, i, arr) => {
		return arr.findIndex(v => v.from === elem.from && v.to === elem.to) === i;
	});

	if (options.logs) {
		console.log('💾 Filtered files duplicated.', input.length - output.length, 'duplicates excluded (total: ' + input.length + ')');
	}

	return output;
};