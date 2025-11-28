import { Organization } from '@/core/interfaces/organizations';
import { UserShortInfo } from '@/core/interfaces/users';

export interface DischargeFile {
    id: number;
    filename: string;
    object_key: string;
    mime_type: string;
    size: number;
    created_at: string;
}

export interface WaterDischargePayload {
    organization_id?: number;
    started_at?: string;
    ended_at?: string;
    flow_rate?: number;
    reason?: string;
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
    files?: DischargeFile[];
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
    files?: DischargeFile[];
}
