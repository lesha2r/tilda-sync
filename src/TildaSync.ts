// 1@ts-nocheck
/* eslint-disable no-async-promise-executor */
import fetch from 'node-fetch';
import utils from './utils.js';
import { handlePage } from './handlePage.js';
import { handleProjectData } from './handleProjectData.js';
import TildaRouterSrc from './TildaRouterSrc.js';
import { handleHtaccess } from './handleHtaccess.js';

interface ISyncOptions {
	publicKey: string,
	secretKey: string,
	debug?: boolean
}

class TildaSync {
    TILDA_URL: string;
    piblicKey: string;
    secretKey: string;
    debug: boolean;

    constructor(options: ISyncOptions) {
        let { publicKey, secretKey, debug } = options;

        this.TILDA_URL = 'http://api.tildacdn.info/v1';

        this.piblicKey = publicKey;
        this.secretKey = secretKey;
        this.debug = (debug === true) ? true : false;
    }

    getProjectsList = () => {
        return new Promise(async (resolve, reject) => {
            let projects;

            try {
                projects = await this.fetcher({
                    url: '/getprojectslist/'
                });

                resolve(projects);
            } catch (err) {
                reject(err);
            }
        });
    };

    getPagesList = (projectId: string) => {
        return new Promise(async (resolve, reject) => {
			try {
				const pages = await this.fetcher({
					url: '/getpageslist/',
					params: {
						projectid: projectId
					}
				}) as TPageResponse;

				resolve(pages);
            } catch (err) {
                reject(err);
            }
        });
    };

    getPage = (pageId: string) => {
        return new Promise(async (resolve, reject) => {
            let pages;

            try {
                pages = await this.fetcher({
                    url: '/getpage/',
                    params: {
                        pageid: pageId
                    }
                });

                resolve(pages);
            } catch (err) {
                reject(err);
            }
        });
    };

    getPageFull = (pageId: string) => {
        return new Promise(async (resolve, reject) => {
            let pages;

            try {
                pages = await this.fetcher({
                    url: '/getpagefull/',
                    params: {
                        pageid: pageId
                    }
                });

                resolve(pages);
            } catch (err) {
                reject(err);
            }
        });
    };

    getPageExport = (pageId: string) => {
        return new Promise(async (resolve, reject) => {
            let pages;

            try {
                pages = await this.fetcher({
                    url: '/getpageexport/',
                    params: {
                        pageid: pageId
                    }
                });

                resolve(pages);
            } catch (err) {
                reject(err);
            }
        });
    };

    getPageFullExport = (pageId: string) => {
        return new Promise(async (resolve, reject) => {
            let pages;

            try {
                pages = await this.fetcher({
                    url: '/getpagefullexport/',
                    params: {
                        pageid: pageId
                    }
                });

                resolve(pages);
            } catch (err) {
                reject(err);
            }
        });
    };

    getProjectExport = (projectId: string): Promise<TProjectResponse> => {
        return new Promise(async (resolve, reject) => {
			try {
            const projectData = await this.fetcher({
                    url: '/getprojectexport/',
                    params: {
                        projectid: projectId
                    }
                }) as TProjectResponse;

                resolve(projectData);
            } catch (err) {
                reject(err);
            }
        });
    };

    importProject = (
        projectId: string,
        folder = projectId,
        routerFile = { isEnabled: true, path: folder, filename: 'pages' + projectId + '.json'}
    ) => {
        return new Promise(async (resolve ,reject) => {
            if (this.debug) console.time('⏱ Import site');
            
            folder = folder + '';

            const routerFileDefaults = { isEnabled: true, path: folder, filename: 'pages' + projectId + '.json'};

            routerFile = { ...routerFileDefaults, ...routerFile };

            if (routerFile.path === undefined || routerFile.path === '') {
                routerFile.path = folder;
            }

            if (routerFile.isEnabled === undefined) {
                routerFile.isEnabled = true;
            }

            if (routerFile.filename === undefined) {
                routerFile.filename = 'pages' + projectId + '.json';
            }

            let toBeDownloaded = [];
    
            let projectData;

            try {
                projectData = await this.getProjectExport(projectId);

				if (projectData.status === 'ERROR') {
                    throw new Error('Tilda API responsed with an error status');
                } else if (projectData.status !== 'FOUND') {
                    throw new Error('Project not found');
                }

                let projectParseResult = await handleProjectData(projectData.result, folder, this.debug);
                
                toBeDownloaded = [ ...projectParseResult.downloads ];

                if (routerFile.isEnabled === true) {
                    handleHtaccess(
                        routerFile.filename,
                        routerFile.path,
                        projectData.result.htaccess,
                        { logs: this.debug}
                    );
                }

            } catch (err: any) {
                this.debugMsg(err);
                reject({ success: false, details: err.message });
                return;
            }
            
            try {
                let pages: TPagesResponse = await this.getPagesList(projectId) as TPagesResponse;

				if (pages.status === 'ERROR') {
                    throw new Error('Tilda API responsed with an error status');
                } else if(pages.status !== 'FOUND') {
                    throw new Error('No pages found');
                }
                
                let i = 0;
                while (i < pages.result.length) {
                    let pageImportResult = await this.importPage(
                        pages.result[i].id,
                        folder,
                        { download: false }
					) as { success: true, downloads: [] }
                    
                    toBeDownloaded = [
						...toBeDownloaded,
						...pageImportResult.downloads
					];
    
                    i++;
                }

            } catch (err: any) {
                this.debugMsg(err.message);
                reject({ success: false, details: err.message });
            }
    
            try {
                this.debugMsg('💾 Starting downloading all project files');
                
                await this.staticDownloader(
                    toBeDownloaded,
                    folder,
                    projectData.result.export_csspath
                );
            } catch (err: any) {
                this.debugMsg(err.message);
                reject({ success: false, details: err.message });
                return;
            }
    
            this.debugMsg('👌 Project import finished successfully');
            if (this.debug) console.timeEnd('⏱ Import site');
    
            resolve({ success: true });
        });
    };

    importPage = (pageId: string, folder = 'imported_pages', options = { download: true }) => {
        return new Promise( async (resolve, reject) => {
            this.debugMsg('📡 Getting page #' + pageId);

            let { download } = options;
                        
            let pageFullExport = await this.getPageFullExport(pageId) as TPageResponse

            let customCssFolder = pageFullExport.result.export_csspath;

            let parseResult = await handlePage(
                pageFullExport.result,
                folder,
                {logs: this.debug}
            );

            if (download === true) {
                this.debugMsg('💾 Starting downloading all project files');
                
                await this.staticDownloader(
                    parseResult.downloads,
                    folder,
                    customCssFolder
                );
            }

            if (parseResult.success === true) {
                this.debugMsg('✅ Page has been imported');
                resolve({ success: true, downloads: parseResult.downloads });
            } else {
                reject({ success: false, details: 'Page parsing failed' });
            }
        });
    };

    staticDownloader = (arr: IFile[], folder: string, exportCssPath = '') => {
        return new Promise(async (resolve, reject) => {
            try {
                let toBeDownloadedFiltered = utils.filterDownloadList(arr, {
                    logs: this.debug
                });

                let i = 0;
                while (i < toBeDownloadedFiltered.length) {
                    let fileInfo = toBeDownloadedFiltered[i];

                    utils.downloadFile(fileInfo, folder, this.debug);

                    if (fileInfo.to === 'custom.css' && exportCssPath !== '') {
                        let fileInfoUpd = { ...fileInfo };
                        fileInfoUpd.subfolder = '';
                        utils.downloadFile(fileInfoUpd, folder, this.debug);
                    }

                    await utils.addDelay(120);

                    i++;
                }

                resolve(true);
            } catch (err) {
                this.debugMsg('❌ Error on downloader loop');
                reject(err);
            }
        });
    };

    fetcher = (options: {url: string, params?: any}) => {
        return new Promise (async (resolve, reject) => {
            let { url, params } = options;
    
            try {
                if (!url) throw new Error('Missing URL');
                
                let fetchOptions = {
                    method: 'GET',
                };

                let queryURL = this.TILDA_URL;
                queryURL += url;
                queryURL += '?publickey=' + this.piblicKey;
                queryURL += '&secretkey=' + this.secretKey;
                
                for (let key in params) {
                    queryURL += '&' + key + '=' + params[key];
                }

                const resultRaw = await fetch(queryURL, fetchOptions);
                const result = await resultRaw.json() as TTildaResponse
                        
                if (result.status === 'ERROR') {
                    throw new Error('Fetched result status: ERROR');
                }

                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    };

    debugMsg = (text: string) => {
        if (this.debug === true) console.log(text);
    };
}

export const TildaRouter = TildaRouterSrc;
export default TildaSync;