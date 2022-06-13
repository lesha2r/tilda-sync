/* eslint-disable no-async-promise-executor */
import fetch from 'node-fetch';
import { handlePage } from './handlePage.js';
import { handleHtaccess } from './handleHtaccess.js';
import { handleProjectData } from './handleProjectData.js';
import { filterDownloadList, downloadFile, addDelay } from './helpers.js';
import TildaRouterSrc from './TildaRouterSrc.js';

/**
 * Creates instance of TildaSync
 * Allows to make API calls and import the whole site from Tilda CC
 * @param { Object } options options used for creating the object
 * @param { String } options.publicKey Tilda API public key
 * @param { String } options.secretKey Tilda API secret key
 * @param { Boolean } [options.debug = false] turns on/off debug messages in console
 * @param { String } [options.apiUrl = http://api.tildacdn.info/v1] Tilda API url
 */
function TildaSync( options ) {
	let { publicKey, secretKey, apiUrl, debug } = options;

	this.TILDA_URL = (apiUrl) ? apiUrl : 'http://api.tildacdn.info/v1';

	this.piblicKey = publicKey;
	this.secretKey = secretKey;

	this.debugMode = (debug === true) ? true : false;

	/**
     * Get all projects available for credentials
     */
	this.getProjectsList = () => {
		return new Promise(async (resolve, reject) => {
			let projects;

			try {
				projects = await fetcher({
					url: '/getprojectslist/'
				});

				resolve(projects);
			} catch (err) {
				reject(err);
			}
		});

	};

	/**
     * Get pages of the specified project
     * @param { String } projectId ID of the project
     */
	this.getPagesList = (projectId) => {
		return new Promise(async (resolve, reject) => {
			let pages;

			try {
				pages = await fetcher({
					url: '/getpageslist/',
					params: {
						projectid: projectId
					}
				});
			} catch (err) {
				reject(err);
			}

			resolve(pages);
		});
	};

	/**
     * Get page data (internal page's HTML only)
     * @param { String } pageId ID of the page
     */
	this.getPage = (pageId) => {
		return new Promise(async (resolve, reject) => {
			let pages;

			try {
				pages = await fetcher({
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

	/**
     * Get full page data (full page HTML including head, body)
     * @param { String } pageId ID of the page
     */
	this.getPageFull = (pageId) => {
		return new Promise(async (resolve, reject) => {
			let pages;

			try {
				pages = await fetcher({
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

	/**
     * Get page's internal HTML and data necessary for export (HTML + files)
     * @param { String } pageId ID of the page
     */
	this.getPageExport = (pageId) => {
		return new Promise(async (resolve, reject) => {
			let pages;

			try {
				pages = await fetcher({
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

	/**
     * Get full page's HTML (+ head, body) and data necessary for export (js, css, img)
     * @param { String } pageId ID of the page
     */
	this.getPageFullExport = (pageId) => {
		return new Promise(async (resolve, reject) => {
			let pages;

			try {
				pages = await fetcher({
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

	/**
     * Get common project data (including .htaccess)
     * @param { String } projectId ID of the project
     */
	this.getProjectExport = (projectId) => {
		return new Promise(async (resolve, reject) => {
			let projectData;

			try {
				projectData = await fetcher({
					url: '/getprojectexport/',
					params: {
						projectid: projectId
					}
				});

				resolve(projectData);
			} catch (err) {
				reject(err);
			}
		});
	};

	/**
     * Complete import of the Tilda project
     * @param { String } projectId ID of the project
     * @param { String } [folder=projectId] destination for exported files
     * @param { Object } routerFile parameters for generating router file
     * @param { Boolean } routerFile.isEnabled enable/disable generating router file from htaccess
     * @param { String } routerFile.path destination for generated router file
     * @param { String } routerFile.filename generated router file name
     */
	this.importProject = (
		projectId,
		folder = projectId,
		routerFile = { isEnabled: true, path: folder, filename: 'pages' + projectId + '.json'}
	) => {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve ,reject) => {
			if (this.debugMode) console.time('⏱ Import site');
			
			folder = folder + '';

			const routerFileDefaults = { isEnabled: true, path: folder, filename: 'pages' + projectId + '.json'};

			routerFile = { ...routerFileDefaults, ...routerFile };

			// Check and prepare settings for router file (parsed .htaccess file)
			if (routerFile.path === undefined || routerFile.path === '') {
				routerFile.path = folder;
			}

			if (routerFile.isEnabled === undefined) {
				routerFile.isEnabled = true;
			}

			if (routerFile.filename === undefined) {
				routerFile.filename = 'pages' + projectId + '.json';
			}

			// List of files for the whole project that should be downloaded
			// Note: Global list used for downloading only unique files
			let toBeDownloaded = [];
    
			// Step 1: Get all necessary project data
			let projectData;

			try {
				// Get common project data
				projectData = await this.getProjectExport(projectId);

				// Handle response status
				if (projectData.status === 'ERROR') {
					throw new Error('Tilda API responsed with an error status');
				} else if (projectData.status !== 'FOUND') {
					throw new Error('Project not found');
				}

				// Handle common project data...
				let projectParseResult = await handleProjectData(projectData.result, folder, this.debugMode);
                
				// ... and add its files to downloads list
				toBeDownloaded = [ ...projectParseResult.downloads ];

				if (routerFile.isEnabled === true) {
					// ... then parse htaccess value
					handleHtaccess(
						routerFile.filename,
						routerFile.path,
						projectData.result.htaccess,
						{ logs: this.debugMode}
					);
				}

			} catch (err) {
				debugMsg(err);
				reject({ success: false, details: err.message });
				return;
			}
            
			// Step 2: Get all pages of the current project
			try {
				let pages = await this.getPagesList(projectId);

				// Handle response status
				if (pages.status === 'ERROR') {
					throw new Error('Tilda API responsed with an error status');
				} else if(pages.status !== 'FOUND') {
					throw new Error('No pages found');
				}
                
				// Step 3: Import each page and add its files to download list
				let i = 0;
				while (i < pages.result.length) {
					let pageImportResult = await this.importPage(
						pages.result[i].id,
						folder,
						{ download: false });
                    
					// Add page's files to the download list
					toBeDownloaded = [...toBeDownloaded, ...pageImportResult.downloads];
    
					i++;
				}

			} catch (err) {
				debugMsg(err.message);
				reject({ success: false, details: err.message });
			}
    
			// Step 4: Download all files gathered for the project and its pages
			try {
				debugMsg('💾 Starting downloading all project files');
				
				await staticDownloader(
					toBeDownloaded,
					folder,
					projectData.result.export_csspath
				);
			} catch (err) {
				debugMsg(err.message);
				reject({ success: false, details: err.message });
				return;
			}
    
			debugMsg('👌 Project import finished successfully');
			if (this.debugMode) console.timeEnd('⏱ Import site');
    
			resolve({ success: true });
		});
	};

	/**
	 * 
	 * @param { String } pageId ID of page
	 * @param { String } folder destination for exported files
	 * @param { Object } options extra parameters
	 * @param { Boolean } options.download enable/disable static downloading [default: true] 
	 */
	this.importPage = (pageId, folder = 'imported_pages', options = { downloadStatics: true }) => {
		return new Promise( async (resolve, reject) => {
			debugMsg('📡 Getting page #' + pageId);

			let { downloadStatics } = options;
						
			// Request page's full data
			let pageFullExport = await this.getPageFullExport(pageId);

			let customCssFolder = pageFullExport.result.export_csspath;

			// Parse the data received
			let parseResult = await handlePage(
				pageFullExport.result,
				folder,
				this.debugMode
			);

			if (downloadStatics === true) {
				debugMsg('💾 Starting downloading all project files');
				
				await staticDownloader(
					parseResult.downloads,
					folder,
					customCssFolder
				);
			}

			if (parseResult.success === true) {
				debugMsg('✅ Page has been imported');
				resolve({ success: true, downloads: parseResult.downloads });
			} else {
				reject({ success: false, details: 'Page parsing failed' });
			}
		});
	};

	const staticDownloader = (arr, folder, exportCssPath = '') => {
		return new Promise(async (resolve, reject) => {
			try {
			// Filter array of downloads to excluded repeated files
				let toBeDownloadedFiltered = filterDownloadList(arr, {
					logs: this.debugMode
				});

				// Download loop
				let i = 0;
				while (i < toBeDownloadedFiltered.length) {
					// File info: from, to, subfolder
					let fileInfo = toBeDownloadedFiltered[i];

					// Download function
					downloadFile(fileInfo, folder, this.debugMode);

					// Fix for custom.css:
					// While using custom subfolder for css files, Tilda doesn't update
					// path for custom.css file correctly (it remains /custom.css instead of /subfolder/custom.css).
					// This fix duplicates custom.css into the main project folder.
					if (fileInfo.to === 'custom.css' && exportCssPath !== '') {
					// Update subfolder to be downloaded to
						let fileInfoUpd = { ...fileInfo };
						fileInfoUpd.subfolder = '';
		
						// Download custom.css one more time
						downloadFile(fileInfoUpd, folder, this.debugMode);
					}

					// Custom delay between downloads
					await addDelay(120);

					i++;
				}

				resolve(true);
			} catch (err) {
				debugMsg('❌ Error on downloader loop');
				reject(err);
			}
		});
		
	}; 

	// Tilda fetching function
	const fetcher = (options) => {
		return new Promise (async (resolve, reject) => {
			let { url, params } = options;
    
			try {
				if (!url) throw new Error('Missing URL');
				
				let options = {
					method: 'GET',
				};

				let queryURL = this.TILDA_URL;
				queryURL += url;
				queryURL += '?publickey=' + this.piblicKey;
				queryURL += '&secretkey=' + this.secretKey;
                
				for (let key in params) {
					queryURL += '&' + key + '=' + params[key];
				}

				let result = await fetch(queryURL, options);
				result = result.json();
						
				if (result.status === 'ERROR') {
					throw new Error('Fetched result status: ERROR');
				}

				resolve(result);
			} catch (err) {
				reject(err);
			}
		});
	};

	const debugMsg = (text) => {
		if (this.debugMode === true) console.log(text);
	};
}

export const TildaRouter = TildaRouterSrc;

export default TildaSync;