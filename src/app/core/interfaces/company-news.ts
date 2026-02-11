export interface CompanyNewsItem {
    id: number;
    uz: string;
    ru: string;
    eng: string;
    uztext: string;
    rutext: string;
    engtext: string;
    uzsmall: string;
    rusmall: string;
    engsmall: string;
    date: string;
    img: string;
    views: number;
}

export interface CompanyNewsMeta {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}

export interface CompanyNewsLinks {
    self: { href: string };
    next?: { href: string };
    last: { href: string };
}

export interface CompanyNewsResponse {
    items: CompanyNewsItem[];
    _meta: CompanyNewsMeta;
    _links: CompanyNewsLinks;
}
