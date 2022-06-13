import { createFolder } from './helpers.js';
import fs from 'fs';

const fsp = fs.promises;

export const handlePage = (data, folder, options = { logs: false }) => {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async ( resolve, reject ) => {
		try {
			if (!data || !folder) throw new Error('No data or no folder passed');

			let { logs } = options;

			// Create folder
			await createFolder(folder, { logs });

			// If js, css, img has specified path, create folder for it
			let jsFolder = (data.export_jspath && data.export_jspath !== '') ? data.export_jspath : null;
			let cssFolder = (data.export_csspath && data.export_csspath !== '') ? data.export_csspath : null;
			let imgFolder = (data.export_imgpath && data.export_imgpath !== '') ? data.export_imgpath : null;

			// Create folders for files if necessary
			if (jsFolder) await createFolder(folder + '/' + data.export_jspath, { logs });
			if (cssFolder) await createFolder(folder + '/' + data.export_csspath, { logs });
			if (imgFolder) await createFolder(folder + '/' + data.export_imgpath, { logs });

			let pageId = data.filename;
			await fsp.writeFile(folder + '/' + pageId, data.html);

			// Array for downloads to be executed later
			let downloadTasks = [];

			try {
				// Add images to be downloaded
				if (data.images && data.images.length > 0) {
					let i = 0;
					while (i < data.images.length) {
						downloadTasks.push({ ...data.images[i], subfolder: imgFolder });
						i++;
					}
				}

				// Add scripts to be downloaded
				if (data.js && data.js.length > 0) {
					let i = 0;
					while (i < data.js.length) {
						downloadTasks.push({ ...data.js[i], subfolder: jsFolder } );
						i++;
					}
				}

				// Add css files to be downloaded
				if (data.css && data.css.length > 0) {
					let i = 0;
					while (i < data.css.length) {
						downloadTasks.push({ ...data.css[i], subfolder: cssFolder });
						i++;
					}
				}
			} catch (err) {
				console.log(err);
				throw new Error('Error on preparing list of downloads');
			}

			resolve({
				success: true,
				details: 'Page has been parsed',
				downloads: downloadTasks
			});

		} catch (err) {
			console.log(err);
			reject({ success: false, details: err.message });
		}
	});
};

