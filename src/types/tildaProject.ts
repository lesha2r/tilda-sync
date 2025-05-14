type TProjectData = {
    id: string;
    userid: string;
    date: string;
    title: string;
    descr: string;
    img: string;
    sort: string;
    alias: string;
    indexpageid: string;
    headerpageid: string;
    footerpageid: string;
    headlinefont: string;   
    textfont: string;
    headlinecolor: string;
    textcolor: string;
    linkcolor: string;
    linkfontweight: string;
    linklinecolor: string;
    linklineheight: string;
    linecolor: string;
    bgcolor: string;
    googleanalyticsid: string;
    googletmid: string;
    customdomain: string;
    url: string;
    isexample: string;
    textfontsize: string;
    textfontweight: string;
    headlinefontweight: string;
    favicon: string;
    nosearch: string;
    yandexmetrikaid: string;
    export_imgpath: string;
    export_csspath: string;
    export_jspath: string;
    export_basepath: string;
    viewlogin: string;
    viewpassword: string;
    viewips: string;
    copyright: string;
    headcode: string;
    userpayment: string;
    formskey: string;
    info_type: string;
    info_tags: string;
    page404id: string;
    myfonts_json: string;
    is_email: string;
    kind: string;
    blocked: string;
    trash: string;
    cnt_folders: string;
    cnt_collabs: string;
    collabs: string;
    designeridn: string;
    changed: string;
    images: Array<{
        from: string;
        to: string;
    }>;
    htaccess: string;
    css: Array<{
        from: string;
        to: string;
    }>;
    js: Array<{
        from: string;
        to: string;     
    }>;
}

type TProjectResponse = {
    status: 'FOUND' | 'NOT_FOUND' | 'ERROR';
    result: TProjectData;
}