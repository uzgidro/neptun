export type VolumeSource = 'static' | 'level_volume';

export interface ReservoirSummaryConfig {
    id: number;
    organization_id: number;
    organization_name: string;
    sort_order: number;
    include_in_total: boolean;
    modsnow_enabled: boolean;
    volume_source: VolumeSource;
}

export interface ReservoirSummaryConfigPayload {
    organization_id: number;
    sort_order: number;
    include_in_total: boolean;
    // Always sent: backend writes zero-value `false` if modsnow_enabled is omitted.
    modsnow_enabled: boolean;
    // Optional on the backend ('static' default), but we always send it explicitly.
    volume_source: VolumeSource;
}
