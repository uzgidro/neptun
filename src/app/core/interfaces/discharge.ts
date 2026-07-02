import { Organization } from '@/core/interfaces/organizations';
import { UserShortInfo } from '@/core/interfaces/users';
import { FileResponse } from '@/core/interfaces/files';

export interface WaterDischargePayload {
    organization_id?: number;
    started_at?: string;
    ended_at?: string;
    flow_rate?: number;
    reason?: string;
}

export interface DischargeCreatePayload {
    organization_id?: number;
    started_at?: string;
    ended_at?: string;
    flow_rate?: number;
    reason?: string;
    file_ids?: number[];
}

export interface DischargeUpdatePayload {
    organization_id?: number;
    started_at?: string;
    ended_at?: string;
    flow_rate?: number;
    reason?: string;
    file_ids?: number[];
}

export interface Cascade {
    id: number;
    name: string;
    total_volume: number;
    hpps: Hpp[];
}

export interface Hpp {
    id: number;
    name: string;
    total_volume: number;
    discharges: DischargeModel[]; // Массив сбросов
}

export interface DischargeModel {
    id: number;
    organization: Organization | null;
    created_by: UserShortInfo;
    updated_by?: UserShortInfo;

    started_at: string;
    ended_at: string | null;

    flow_rate: number;
    total_volume: number;
    reason: string | null;
    is_ongoing: boolean;
    approved: boolean | null;
    files?: FileResponse[];
}


export interface OrganizationInfo {
    id: number;
    name: string;
    parent_organization_id: number | null;
    types: string[];
}

export interface UserInfo {
    id: number;
    name: string;
}

export interface IdleDischargeResponse {
    id: number;
    organization: OrganizationInfo;
    created_by: UserInfo;
    approved_by: UserInfo | null; // (Может быть null)
    started_at: string; // <-- строка
    ended_at: string | null; // <-- строка (может быть null)
    flow_rate: number;
    total_volume: number;
    reason: string | null;
    is_ongoing: boolean;
    approved: boolean | null; // (В JSON `approved` - null, возможно, это boolean)
    files?: FileResponse[];
}

// --- GET /discharges/summary ---

export type SummaryGranularity = 'day' | 'month' | 'year';

export interface SummaryMetrics {
    volume_mln_m3: number;
    avg_flow_rate_m3_s: number;
    generation_loss_mwh: number;
}

// period format depends on granularity: day → "2026-01-15", month → "2026-01", year → "2026"
export interface SummaryBucket extends SummaryMetrics {
    period: string;
}

export interface HPPSummary {
    id: number; // organization_id станции
    name: string;
    buckets: SummaryBucket[]; // полная ось бакетов периода, нули включены
    total: SummaryMetrics;
}

export interface CascadeSummary {
    id: number; // 0 = псевдокаскад «станции без каскада», идёт последним
    name: string; // "" для псевдокаскада
    buckets: SummaryBucket[];
    total: SummaryMetrics;
    hpps: HPPSummary[];
}

export interface SummaryGrandTotal {
    buckets: SummaryBucket[];
    total: SummaryMetrics;
}

export interface DischargeSummaryResponse {
    from: string;
    to: string;
    granularity: SummaryGranularity;
    cascades: CascadeSummary[]; // [] если сбросов и станций нет
    grand_total: SummaryGrandTotal; // всегда присутствует
}
