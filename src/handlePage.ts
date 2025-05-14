import utils from './utils.js';
import fs from 'fs';

const fsp = fs.promises;

// Handles page data
// 1. Creates base folder
// 2. Creates subfolders for js, css, img if specified
// 3. Saves page data to file
// 4. Prepares download tasks for js, css, img
export const handlePage = async (data: TPageData, folder: string, options = { logs: false }) => {
	try {
		if (!data || !folder) throw new Error('No data or no folder passed');

		const { logs } = options;

		// Create base folder
		await utils.createFolder(folder, { logs });

		// If js, css, img has specified path, create folder for it
		const jsFolder = (data.export_jspath) ? data.export_jspath : null;
		const cssFolder = (data.export_csspath) ? data.export_csspath : null;
		const imgFolder = (data.export_imgpath) ? data.export_imgpath : null;

		// Create folders for files if necessary
		await utils.createSubfolder(folder, jsFolder, { logs });
		await utils.createSubfolder(folder, cssFolder, { logs });
		await utils.createSubfolder(folder, imgFolder, { logs });

		const pageId = data.filename;
		await fsp.writeFile(folder + '/' + pageId, data.html);

		// Prepare download tasks
		const downloadTasks = utils.prepareDownloadTasks(data, jsFolder, cssFolder, imgFolder);

		return {
			success: true,
			details: 'Page has been parsed',
			downloads: downloadTasks
		};
	} catch (err) {
		if (options.logs) console.log(err);
		throw err;
	}
};

