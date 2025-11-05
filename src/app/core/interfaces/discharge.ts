import { Organization } from '@/core/interfaces/organizations';
import { UserShortInfo } from '@/core/interfaces/users';

export interface WaterDischargePayload {
    organization_id: number;
    started_at: string;
    ended_at?: string;
    flow_rate: number;
    reason?: string;
}

export interface Cascade {
    id: number;
    name: string;
    hpps: Hpp[];
}

export interface Hpp {
    id: number;
    name: string;
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
}
