// @ts-nocheck
import fs from 'fs';
import https from 'https';

const fsp = fs.promises;

const utils = {
	addDelay: (ms: number = 1000) => {
		return new Promise((resolve) => {
			setTimeout( ()=> resolve(true), ms);
		});
	},
	downloadFile: async (file: IFile, folder: string, logs = false) => {
		if (logs) console.log('💾 Downloading', file.from);

		if (folder.charAt(folder.length - 1) !== '/') folder += '/';

		let subfolder = file.subfolder ? file.subfolder : '';
		if (subfolder.charAt(subfolder.length - 1) !== '/') subfolder += '/';

		const path = folder + subfolder + file.to;

		try {
			await createFolder(folder + subfolder, { logs }); // Ensure the folder exists

			const result = await new Promise((resolve, reject) => {
				https.get(file.from, (response) => {
					const stream = fs.createWriteStream(path);
					response.pipe(stream);

					stream.on('finish', () => resolve({ success: true }));
					stream.on('error', (err) => reject(err));
				}).on('error', (err) => reject(err));
			});

			return result;
		} catch (err: any) {
			if (logs) console.error('Error downloading file:', err.message);
			throw err;
		}
	},
	createFolder: async (folder: string, options = { logs: false }) => {
		try {
			folder = folder.replace('//', '/');
			await fsp.mkdir(folder, { recursive: true });
			return true;
		} catch (err) {
			if (options.logs) console.error('📂 Error on folder creation:', folder);
			throw err;
		}
	},
	filterDownloadList: (input: IFile[], options = { logs: false }) => {
		let output: IFile[] = [];

		output = input.filter((elem: IFile, i: any, arr: IFile[]) => {
			return arr.findIndex(v => v.from === elem.from && v.to === elem.to) === i;
		});

		if (options.logs) {
			console.log('💾 Filtered duplicated files.', input.length - output.length, 'duplicates excluded (total: ' + input.length + ')');
		}

		return output;
	},
	// Make full download list for all types: js, css, img files
	addDownloadTasks: (items, subfolder) => {
		if (items && items.length > 0) return [];

		const output = [];

		for (const item of items) {
			output.push({ ...item, subfolder });
		}

		return output
	},
	prepareDownloadTasks: (data, jsFolder, cssFolder, imgFolder) => {
		const downloadTasks = [
			...utils.addDownloadTasks(data.images, imgFolder),
			...utils.addDownloadTasks(data.js, jsFolder),
			...utils.addDownloadTasks(data.css, cssFolder),
		];
		
		return downloadTasks;
	},
	// Creates subfolder if it doesn't exist
	createSubfolder: async (baseFolder: string, subFolder: string | null, options: any) => {
		if (!subFolder) return;
		await utils.createFolder(`${baseFolder}/${subFolder}`, options);
	},
}

export default utils



