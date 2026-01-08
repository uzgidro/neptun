export interface ValueResponse {
    current: number;
    prev: number;
    year_ago: number;
    two_years_ago: number;
    is_edited?: boolean;
}

export interface ReservoirSummaryResponse {
    organization_id: number | null;
    organization_name: string | null;
    income: ValueResponse;
    volume: ValueResponse;
    level: ValueResponse;
    release: ValueResponse;
    modsnow: ValueResponse;
    incoming_volume: number | null;
    incoming_volume_prev_year: number | null;
    incoming_volume_is_calculated: boolean;
    incoming_volume_prev_year_is_calculated: boolean;
    incoming_volume_is_reset?: boolean;
    incoming_volume_prev_year_is_reset?: boolean;
}

export interface ReservoirSummaryRequest {
    organization_id: number;
    date: string;
    income: number;
    volume: number;
    release: number;
    level: number;
    modsnow_current: number;
    modsnow_year_ago: number;
    total_income_volume?: number | null;
    total_income_volume_prev_year?: number | null;
}
