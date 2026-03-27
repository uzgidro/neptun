// Response from GET /api/v4/manual-comparison/measurements
export interface ManualMeasurementsResponse {
    organization_id: number;
    organization_name: string;
    date: string;
    historical_filter_date: string;
    historical_piezo_date: string;
    filters: ManualFilterEntry[];
    piezometers: ManualPiezoEntry[];
}

export interface ManualFilterEntry {
    location_id: number;
    location_name: string;
    norm: number | null;
    sort_order: number;
    flow_rate: number | null;
    historical_flow_rate: number | null;
}

export interface ManualPiezoEntry {
    piezometer_id: number;
    piezometer_name: string;
    norm: number | null;
    sort_order: number;
    level: number | null;
    anomaly: boolean;
    historical_level: number | null;
}

// Body for POST /api/v4/manual-comparison/measurements
export interface ManualMeasurementsRequest {
    organization_id: number;
    date: string;
    historical_filter_date?: string;
    historical_piezo_date?: string;
    filters?: { location_id: number; flow_rate: number | null; historical_flow_rate: number | null }[];
    piezos?: { piezometer_id: number; level: number | null; anomaly?: boolean; historical_level: number | null }[];
}
