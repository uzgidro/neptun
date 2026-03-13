export interface Location {
    id: number;
    organization_id: number;
    name: string;
    norm: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Piezometer {
    id: number;
    organization_id: number;
    name: string;
    norm: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateLocationRequest {
    organization_id: number;
    name: string;
    norm?: number | null;
    sort_order?: number;
}

export interface UpdateLocationRequest {
    name?: string;
    norm?: number | null;
    sort_order?: number;
}

export interface CreatePiezometerRequest {
    organization_id: number;
    name: string;
    norm?: number | null;
    sort_order?: number;
}

export interface UpdatePiezometerRequest {
    name?: string;
    norm?: number | null;
    sort_order?: number;
}

export interface PiezometerCountsRecord {
    id: number;
    organization_id: number;
    pressure_count: number;
    non_pressure_count: number;
    created_at: string;
    updated_at: string;
}

export interface UpsertPiezometerCountsRequest {
    organization_id: number;
    pressure_count: number;
    non_pressure_count: number;
}
