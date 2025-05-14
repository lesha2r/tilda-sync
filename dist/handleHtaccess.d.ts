type TRoute = {
    type: string;
    alias: string;
    file: string | null;
};
export declare const handleHtaccess: (filename: string, path: string, data: string, options?: {
    logs: boolean;
}) => {
    [key: string]: TRoute;
};
export {};
