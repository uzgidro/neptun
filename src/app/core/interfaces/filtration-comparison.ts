import { Location, Piezometer } from './filtration';

export interface LocationReading extends Location {
    flow_rate: number | null;
}

export interface PiezoReading extends Piezometer {
    level: number | null;
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
    historical: ComparisonSnapshot | null;
}

export interface UpsertRequest {
    organization_id: number;
    date: string;
    filtration_measurements?: { location_id: number; flow_rate: number | null }[];
    piezometer_measurements?: { piezometer_id: number; level: number | null }[];
}
