declare const utils: {
    addDelay: (ms?: number) => Promise<unknown>;
    downloadFile: (file: IFile, folder: string, logs?: boolean) => Promise<unknown>;
    createFolder: (folder: string, options?: {
        logs: boolean;
    }) => Promise<boolean>;
    filterDownloadList: (input: IFile[], options?: {
        logs: boolean;
    }) => IFile[];
    addDownloadTasks: (items: any, subfolder: any) => any[];
    prepareDownloadTasks: (data: any, jsFolder: any, cssFolder: any, imgFolder: any) => any[];
    createSubfolder: (baseFolder: string, subFolder: string | null, options: any) => Promise<void>;
};
export default utils;
