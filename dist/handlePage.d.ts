export declare const handlePage: (data: TPageData, folder: string, options?: {
    logs: boolean;
}) => Promise<{
    success: boolean;
    details: string;
    downloads: any[];
}>;
