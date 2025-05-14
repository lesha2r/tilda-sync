export declare const handleProjectData: (data: TProjectData, folder: string, logs?: boolean) => Promise<{
    success: boolean;
    details: string;
    downloads: any[];
}>;
