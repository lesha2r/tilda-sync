/* eslint-disable no-async-promise-executor */
import { createFolder } from './helpers.js';

/**
 * 
 * @param { Object } data tilda response result object
 * @param { String } folder path for project to be stored
 * @param { Boolean } logs enable/disable logging
 * @returns 
 */
export const handleProjectData = (data, folder, logs = false) => {
	return new Promise(async ( resolve, reject ) => {
		try {
			if (!data || !folder) throw new Error('No data or no folder passed');

			// Create project folder
			await createFolder(folder, { logs });
            
			// Check files path prefix
			const jsFolder = (data.export_jspath && data.export_jspath !== '') ? data.export_jspath : null;
			const cssFolder = (data.export_csspath && data.export_csspath !== '') ? data.export_csspath : null;
			const imgFolder = (data.export_imgpath && data.export_imgpath !== '') ? data.export_imgpath : null;

			// Create folders for files if path prefix specified
			if (jsFolder) await createFolder(folder + '/' + data.export_jspath, { logs });
			if (cssFolder) await createFolder(folder + '/' + data.export_csspath, { logs });
			if (imgFolder) await createFolder(folder + '/' + data.export_imgpath, { logs });

			// Prepare list of downloads required
			let downloadTasks = [];

			if (data.images && data.images.length > 0) {
				let i = 0;
				while (i < data.images.length) {
					downloadTasks.push({ ...data.images[i], subfolder: imgFolder });
					i++;
				}
			}

			if (data.js && data.js.length > 0) {
				let i = 0;
				while (i < data.js.length) {
					downloadTasks.push({ ...data.js[i], subfolder: jsFolder } );
					i++;
				}
			}

			if (data.css && data.css.length > 0) {
				let i = 0;
				while (i < data.css.length) {
					downloadTasks.push({ ...data.css[i], subfolder: cssFolder });
					i++;
				}
			}

			// Resolve status and download lists so it could be handled later
			resolve({
				success: true,
				details: 'Project data has been parsed',
				downloads: downloadTasks
			});
		} catch (err) {
			if (logs) console.log(err);
			reject({ success: false, details: err.message });
		}
	});
};

