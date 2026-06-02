export interface ReservoirSummaryConfig {
    id: number;
    organization_id: number;
    organization_name: string;
    sort_order: number;
    include_in_total: boolean;
}

export interface ReservoirSummaryConfigPayload {
    organization_id: number;
    sort_order: number;
    include_in_total: boolean;
}
