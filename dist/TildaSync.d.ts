import TildaRouterSrc from './TildaRouterSrc.js';
interface ISyncOptions {
    publicKey: string;
    secretKey: string;
    debug?: boolean;
}
declare class TildaSync {
    TILDA_URL: string;
    piblicKey: string;
    secretKey: string;
    debug: boolean;
    constructor(options: ISyncOptions);
    getProjectsList: () => Promise<unknown>;
    getPagesList: (projectId: string) => Promise<unknown>;
    getPage: (pageId: string) => Promise<unknown>;
    getPageFull: (pageId: string) => Promise<unknown>;
    getPageExport: (pageId: string) => Promise<unknown>;
    getPageFullExport: (pageId: string) => Promise<unknown>;
    getProjectExport: (projectId: string) => Promise<TProjectResponse>;
    importProject: (projectId: string, folder?: string, routerFile?: {
        isEnabled: boolean;
        path: string;
        filename: string;
    }) => Promise<unknown>;
    importPage: (pageId: string, folder?: string, options?: {
        download: boolean;
    }) => Promise<unknown>;
    staticDownloader: (arr: IFile[], folder: string, exportCssPath?: string) => Promise<unknown>;
    fetcher: (options: {
        url: string;
        params?: any;
    }) => Promise<unknown>;
    debugMsg: (text: string) => void;
}
export declare const TildaRouter: typeof TildaRouterSrc;
export default TildaSync;
