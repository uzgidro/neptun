export interface UzgidroNewsItem {
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

export interface UzgidroNewsMeta {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}

export interface UzgidroNewsLinks {
    self: { href: string };
    next?: { href: string };
    last: { href: string };
}

export interface UzgidroNewsResponse {
    items: UzgidroNewsItem[];
    _meta: UzgidroNewsMeta;
    _links: UzgidroNewsLinks;
}
