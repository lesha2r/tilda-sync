import fs from 'fs';
import utils from './utils.js';
const ALIAS_ON = 'On';
const TYPE_DIRECTORY_INDEX = 'DirectoryIndex';
const TYPE_REWRITE_RULE = 'RewriteRule';
const parseLine = (line) => {
    let arr = line.split(' ');
    return {
        type: arr[0],
        alias: arr[1],
        file: arr[2] ? arr[2] : null
    };
};
export const handleHtaccess = (filename, path, data, options = { logs: false }) => {
    const output = data
        .replace(/\n\n/g, '\n')
        .split(/\n/g)
        .filter(rec => rec !== '')
        .map(rec => parseLine(rec));
    const outputObj = {};
    let i = 0;
    objStart: while (i < output.length) {
        let el = output[i];
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
        el.alias = el.alias.replace(/\^|\$/g, '');
        outputObj[el.alias] = { type: el.type, alias: el.alias, file: el.file };
        i++;
    }
    const JSONtoSave = JSON.stringify(outputObj, null, 2);
    if (path !== '')
        utils.createFolder(path, { logs: options.logs });
    if (path.charAt(path.length - 1) !== '/')
        path += '/';
    if (!filename.includes('.json'))
        filename += '.json';
    fs.writeFile(path + filename, JSONtoSave, (err) => {
        if (err) {
            if (options.logs)
                console.error('Error writing file:', err);
            throw new Error('Failed to write JSON file');
        }
        if (options.logs)
            console.log('🔗 Route JSON has been created');
    });
    return outputObj;
};
