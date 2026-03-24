import { Location, Piezometer } from './filtration';

export interface LocationReading extends Location {
    flow_rate: number | null;
}

export interface PiezoReading extends Piezometer {
    level: number | null;
    anomaly: boolean;
}

export interface PiezometerCounts {
    pressure: number;
    non_pressure: number;
}

export interface ComparisonSnapshot {
    date: string;
    level: number | null;
    volume: number | null;
    locations: LocationReading[];
    piezometers: PiezoReading[];
    piezometer_counts: PiezometerCounts;
}

export interface OrgComparison {
    organization_id: number;
    organization_name: string;
    current: ComparisonSnapshot;
    historical_filter: ComparisonSnapshot | null;
    historical_piezo: ComparisonSnapshot | null;
    filter_comparison_date?: string | null;
    piezo_comparison_date?: string | null;
}

export interface SimilarDate {
    date: string;
    level: number | null;
    volume: number | null;
}

export interface OrgSimilarDates {
    organization_id: number;
    organization_name: string;
    reference_date: string;
    reference_level: number | null;
    reference_volume: number | null;
    similar_dates: SimilarDate[];
}

export interface UpsertRequest {
    organization_id: number;
    date: string;
    filtration_measurements?: { location_id: number; flow_rate: number | null }[];
    piezometer_measurements?: { piezometer_id: number; level: number | null; anomaly?: boolean }[];
    filter_comparison_date?: string | null;
    historical_filtration_measurements?: { location_id: number; flow_rate: number | null }[];
    piezo_comparison_date?: string | null;
    historical_piezometer_measurements?: { piezometer_id: number; level: number | null; anomaly?: boolean }[];
    clear_filter_comparison_date?: boolean;
    clear_piezo_comparison_date?: boolean;
}
