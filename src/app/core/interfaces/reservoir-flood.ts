export interface ReservoirFloodConfig {
    id: number;
    organization_id: number;
    organization_name?: string;
    sort_order: number;
    is_active: boolean;
    updated_at: string;
}

export interface ReservoirFloodConfigPayload {
    organization_id: number;
    sort_order: number;
    is_active: boolean;
}

export interface ReservoirFloodHourlyRecord {
    id: number;
    organization_id: number;
    organization_name?: string;
    recorded_at: string;
    water_level_m: number | null;
    water_volume_mln_m3: number | null;
    inflow_m3s: number | null;
    outflow_m3s: number | null;
    ges_flow_m3s: number | null;
    filtration_m3s: number | null;
    idle_discharge_m3s: number | null;
    duty_name: string | null;
    created_by_user_id?: number | null;
    updated_at: string;
}

// Optional semantics: omitted = preserve, null = clear, value = write.
export interface ReservoirFloodHourlyPayload {
    organization_id: number;
    recorded_at: string;
    water_level_m?: number | null;
    water_volume_mln_m3?: number | null;
    inflow_m3s?: number | null;
    outflow_m3s?: number | null;
    ges_flow_m3s?: number | null;
    filtration_m3s?: number | null;
    idle_discharge_m3s?: number | null;
    duty_name?: string | null;
}
