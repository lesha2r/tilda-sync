import utils from './utils.js';
import fs from 'fs';
const fsp = fs.promises;
export const handlePage = async (data, folder, options = { logs: false }) => {
    try {
        if (!data || !folder)
            throw new Error('No data or no folder passed');
        const { logs } = options;
        await utils.createFolder(folder, { logs });
        const jsFolder = (data.export_jspath) ? data.export_jspath : null;
        const cssFolder = (data.export_csspath) ? data.export_csspath : null;
        const imgFolder = (data.export_imgpath) ? data.export_imgpath : null;
        await utils.createSubfolder(folder, jsFolder, { logs });
        await utils.createSubfolder(folder, cssFolder, { logs });
        await utils.createSubfolder(folder, imgFolder, { logs });
        const pageId = data.filename;
        await fsp.writeFile(folder + '/' + pageId, data.html);
        const downloadTasks = utils.prepareDownloadTasks(data, jsFolder, cssFolder, imgFolder);
        return {
            success: true,
            details: 'Page has been parsed',
            downloads: downloadTasks
        };
    }
    catch (err) {
        if (options.logs)
            console.log(err);
        throw err;
    }
};
