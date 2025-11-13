export interface ReservoirDeviceSummaryResponse {
    id: number;
    organization_id: number;
    organization_name: string;
    device_type_name: string;
    count_total: number;
    count_installed: number;
    count_operational: number;
    count_faulty: number;
    count_active: number;
    count_automation_scope: number;
    criterion_1?: number | null;
    criterion_2?: number | null;
    created_at: string;
    updated_at?: string | null;
    updated_by_user_id?: number | null;
}

export interface PatchReservoirDeviceSummaryItem {
    organization_id: number;
    device_type_name: string;
    count_total?: number | null;
    count_installed?: number | null;
    count_operational?: number | null;
    count_faulty?: number | null;
    count_active?: number | null;
    count_automation_scope?: number | null;
    criterion_1?: number | null;
    criterion_2?: number | null;
}

export interface PatchReservoirDeviceSummaryRequest {
    updates: PatchReservoirDeviceSummaryItem[];
}
