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
declare class TildaRouterSrc implements TildaRouterSrcInstance {
    private pathfile;
    pathToHTMLs: string;
    page404: string | null;
    pageIndex?: string | null;
    routes: any;
    constructor(pathfile: string, options?: TildaRouterSrcOptions);
    updateRoutes(): Promise<void>;
    getRoutes(): any;
    controller: (req: any, res: any, next: any) => Promise<void>;
    startup(): void;
}
export default TildaRouterSrc;
