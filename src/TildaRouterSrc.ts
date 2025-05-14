import fs from 'fs';
import path from 'path';

const __dirname = path.resolve('.');
const fsp = fs.promises;

type TildaRouterSrcOptions = {
    pathToHTMLs: string | null;
    pageIndex?: string | null;
    page404?: string | null;
};

type TildaRouterSrcInstance = {
    pathToHTMLs: string;
    page404: string | null;
    pageIndex?: string | null;
    routes: any;
    updateRoutes: () => Promise<void>;
    getRoutes: () => any;
    controller: (req: any, res: any, next: any) => Promise<void>;
    startup: () => void;
};

class TildaRouterSrc implements TildaRouterSrcInstance {
    pathToHTMLs: string;
    page404: string | null;
    pageIndex?: string | null;
    routes: any;

    constructor(
        private pathfile: string,
        options: TildaRouterSrcOptions = {
            pathToHTMLs: null,
            pageIndex: null,
            page404: null
        }
    ) {
        if (!options.pathToHTMLs) {
			throw new Error('Set path to static file at options.pathToStatics');
		}
        
        this.pathToHTMLs = (/\/$/.test(options.pathToHTMLs)) ? options.pathToHTMLs : options.pathToHTMLs + '/';
        this.page404 = (options.page404) ? options.page404 : 'auto';
        this.pageIndex = options.pageIndex;
        this.routes = null;
        this.startup();
    }

    async updateRoutes() {
        const fileData = await fsp.readFile(path.resolve(__dirname, this.pathfile));
        this.routes = JSON.parse(fileData.toString());
    }

    getRoutes() {
        return this.routes;
    }

    controller = async (req: any, res: any, next: any) => {
        if (this.routes === null) await this.updateRoutes();

        let key = req.baseUrl;
        if (!key || key === '/' || key === '') {
            key = (this.pageIndex && this.pageIndex !== 'auto') ? this.pageIndex : 'index';
        }

        if (key.charAt(0) === '/') key = key.substring(1);
        
        let pages = this.getRoutes();

        if (pages[key] && pages[key].file.includes('.html')) {
            let pageFile = this.pathToHTMLs + pages[key].file;
            res.sendFile(pageFile, { root: path.join(__dirname) });
        } else if (this.page404 === 'auto' && pages['404']) {
            let pageFile = this.pathToHTMLs + pages['404'].file;
            res.sendFile(pageFile, { root: path.join(__dirname) });
        } else if (this.page404 && typeof this.page404 === 'string' && pages[this.page404]) {
            let pageFile = this.pathToHTMLs + pages[this.page404].file;
            res.sendFile(pageFile, { root: path.join(__dirname) });
        } else {
            next();
        }
    };

    startup() {
        this.updateRoutes();
    }
}

export default TildaRouterSrc;