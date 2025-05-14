type TPageData = {
    id: string;
    projectid: string;
    date: string;
    title: string;
    descr: string;
    img: string;
    sort: string;
    published: string;
    featureimg: string;
    alias: string;
    filename: string;
    export_jspath: string;
    export_csspath: string;
    export_imgpath: string;
    export_basepath: string;
    project_alias: string;
    page_alias: string;
    project_domain: string;
    html: string;
    images: Array<{
        from: string;
        to: string;
    }>;
    js: Array<{
        from: string;
        to: string;
        attrs?: any;
    }>;
    css: Array<{
        from: string;
        to: string;
    }>;
};
type TPageResponse = {
    status: 'FOUND' | 'NOT_FOUND' | 'ERROR';
    result: TPageData;
};
