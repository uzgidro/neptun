export interface SnowCoverZone {
    min_elev: number;
    max_elev: number;
    sca_pct: number;
}

export interface SnowCoverItem {
    organization_id: number;
    organization_name: string;
    overall_cover: number | null;
    zones: SnowCoverZone[] | null;
    resource_date: string | null;
}

export interface SnowCoverPeriod {
    date: string;
    overall_cover: number | null;
    items: SnowCoverItem[];
}

export interface SnowCoverResponse {
    today: SnowCoverPeriod;
    yesterday: SnowCoverPeriod;
    year_ago: SnowCoverPeriod;
}
