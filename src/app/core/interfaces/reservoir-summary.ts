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
    incoming_volume_base_date?: string;
    incoming_volume_base_value?: number;
    incoming_volume_prev_year_base_date?: string;
    incoming_volume_prev_year_base_value?: number;
}

export interface ReservoirSummaryRequest {
    organization_id: number;
    date: string;
    income?: number | null;
    volume?: number | null;
    release?: number | null;
    level?: number | null;
    modsnow_current?: number | null;
    modsnow_year_ago?: number | null;
    total_income_volume?: number | null;
    total_income_volume_prev_year?: number | null;
}
