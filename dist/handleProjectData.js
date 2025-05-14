import utils from './utils.js';
export const handleProjectData = async (data, folder, logs = false) => {
    try {
        if (!data || !folder)
            throw new Error('No data or no folder passed');
        await utils.createFolder(folder, { logs });
        const jsFolder = (data.export_jspath) ? data.export_jspath : null;
        const cssFolder = (data.export_csspath) ? data.export_csspath : null;
        const imgFolder = (data.export_imgpath) ? data.export_imgpath : null;
        await utils.createSubfolder(folder, jsFolder, { logs });
        await utils.createSubfolder(folder, cssFolder, { logs });
        await utils.createSubfolder(folder, imgFolder, { logs });
        const downloadTasks = utils.prepareDownloadTasks(data, jsFolder, cssFolder, imgFolder);
        return {
            success: true,
            details: 'Project data has been parsed',
            downloads: downloadTasks
        };
    }
    catch (err) {
        if (logs)
            console.log(err);
        throw err;
    }
};
