import fs from 'fs';
import https from 'https';
const fsp = fs.promises;
const utils = {
    addDelay: (ms = 1000) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), ms);
        });
    },
    downloadFile: async (file, folder, logs = false) => {
        if (logs)
            console.log('💾 Downloading', file.from);
        if (folder.charAt(folder.length - 1) !== '/')
            folder += '/';
        let subfolder = file.subfolder ? file.subfolder : '';
        if (subfolder.charAt(subfolder.length - 1) !== '/')
            subfolder += '/';
        const path = folder + subfolder + file.to;
        try {
            await createFolder(folder + subfolder, { logs });
            const result = await new Promise((resolve, reject) => {
                https.get(file.from, (response) => {
                    const stream = fs.createWriteStream(path);
                    response.pipe(stream);
                    stream.on('finish', () => resolve({ success: true }));
                    stream.on('error', (err) => reject(err));
                }).on('error', (err) => reject(err));
            });
            return result;
        }
        catch (err) {
            if (logs)
                console.error('Error downloading file:', err.message);
            throw err;
        }
    },
    createFolder: async (folder, options = { logs: false }) => {
        try {
            folder = folder.replace('//', '/');
            await fsp.mkdir(folder, { recursive: true });
            return true;
        }
        catch (err) {
            if (options.logs)
                console.error('📂 Error on folder creation:', folder);
            throw err;
        }
    },
    filterDownloadList: (input, options = { logs: false }) => {
        let output = [];
        output = input.filter((elem, i, arr) => {
            return arr.findIndex(v => v.from === elem.from && v.to === elem.to) === i;
        });
        if (options.logs) {
            console.log('💾 Filtered files duplicated.', input.length - output.length, 'duplicates excluded (total: ' + input.length + ')');
        }
        return output;
    },
    addDownloadTasks: (items, subfolder) => {
        if (items && items.length > 0)
            return [];
        const output = [];
        for (const item of items) {
            output.push({ ...item, subfolder });
        }
        return output;
    },
    prepareDownloadTasks: (data, jsFolder, cssFolder, imgFolder) => {
        const downloadTasks = [
            ...utils.addDownloadTasks(data.images, imgFolder),
            ...utils.addDownloadTasks(data.js, jsFolder),
            ...utils.addDownloadTasks(data.css, cssFolder),
        ];
        return downloadTasks;
    },
    createSubfolder: async (baseFolder, subFolder, options) => {
        if (!subFolder)
            return;
        await utils.createFolder(`${baseFolder}/${subFolder}`, options);
    },
};
export default utils;
