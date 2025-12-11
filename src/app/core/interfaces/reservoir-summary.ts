export interface ValueResponse {
    current: number;
    prev: number;
    year_ago: number | null;
    two_years_ago: number | null;
}

export interface ReservoirSummaryResponse {
    organization_id: number | null;
    organization_name: string | null;
    income: ValueResponse;
    volume: ValueResponse;
    level: ValueResponse;
    release: ValueResponse;
    incoming_volume: number;
    incoming_volume_prev_year: number;
}

export interface ReservoirSummaryRequest {
    organization_id: number;
    date: string;
    income: number;
    volume: number;
    release: number;
    level: number;
}
