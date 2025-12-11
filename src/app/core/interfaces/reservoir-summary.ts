export interface ValueResponse {
    current: number;
    prev: number;
    year_ago: number | null;
    two_years_ago: number | null;
}

export interface ReservoirSummaryResponse {
    reservoir_name: any;
    volume_today: any;
    volume_yesterday: any;
    volume_difference: any;
    volume_1_year_ago: any;
    volume_2_years_ago: any;
    level_today: any;
    level_yesterday: any;
    level_difference: any;
    level_1_year_ago: any;
    level_2_years_ago: any;
    outflow: any;
    inflow: any;
    organization_id: number | null;
    organization_name: string | null;
    income: ValueResponse;
    volume: ValueResponse;
    level: ValueResponse;
    release: ValueResponse;
    incoming_volume: number;
    incoming_volume_prev_year: number;
}
