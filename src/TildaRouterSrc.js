import fs from 'fs';
import path from 'path';

let __dirname = path.resolve('.');
let fsp = fs.promises;

// Routing file format:
// { 
//   "index": {
//     "type": "RewriteRule",
//     "file": "page24921791.html"
//   },
//   ...etc
// }

function TildaRouterSrc(
	pathfile,
	options = {
		pathToHTMLs: null,
		pageIndex: null,
		page404: null
	}) {
	if (!options.pathToHTMLs) throw new Error('Set path to static file at options.pathToStatics');
    
	this.pathToHTMLs = (/\/$/.test(options.pathToHTMLs)) ? options.pathToHTMLs : options.pathToHTMLs + '/';
	this.page404 = (options.page404) ? options.page404 : 'auto';

	// Options
	this.pageIndex = options.pageIndex;

	// Storage for parsed JSON
	this.routes = null;
    
	// Read JSON file and save values to this.routes
	this.updateRoutes = async () => {
		let fileData = await fsp.readFile(path.resolve(__dirname, pathfile));
		this.routes = JSON.parse(fileData);
	};

	// Request update on startup
	this.updateRoutes();

	// Get the object with routings rules
	this.getRoutes = () => this.routes;

	// Controller for express
	this.controller = (req, res, next) => {
		if (this.routes === null) this.updateRoutes();

		let key = req.params['0'];

		if (!key || key === '/' || key === '') key = (this.pageIndex && this.pageIndex !== 'auto') ? this.pageIndex : 'index';
		if (key.charAt(0) === '/') key = key.substring(1);
        
		let pages = this.getRoutes();

		// If json contains requested key
		if (pages[key] && pages[key].file.includes('.html')) {

			let pageFile = this.pathToHTMLs + pages[key].file;
			res.sendFile(pageFile, { root: path.join(__dirname) });


		// If page is not in json, 'page404' is set to 'auto' and there is 404 page in json
		} else if (this.page404 === 'auto' && pages['404']) {
			
			let pageFile = this.pathToHTMLs + pages['404'].file;
			res.sendFile( pageFile, { root: path.join(__dirname) });


		// If page is not in json, custom 'page404' set and there is such page in json
		} else if (this.page404 && typeof this.page404 === 'string' && pages[this.page404]) {
			let pageFile = this.pathToHTMLs + pages[this.page404].file;
			res.sendFile(pageFile, { root: path.join(__dirname) });
		
        
		// Let the request go next in all other scenarios
		} else {
			next();
		}
	};
}

export default TildaRouterSrc;