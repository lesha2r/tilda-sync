type TPageListItem = {
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
}

type TPagesResponse = {
    status: 'FOUND' | 'NOT_FOUND' | 'ERROR';
    result: TPageListItem[];
}

