import { FileResponse } from '@/core/interfaces/files';

export interface DutyViolationResponse {
    id: number;
    organization_id: number;
    organization_name?: string;
    start_time: string; // ISO 8601
    end_time: string;   // ISO 8601
    duty_officer_name: string;
    reason: string;
    files?: FileResponse[];
    created_at: string;
    created_by_user_id?: number;
    updated_at: string;
}

export interface DutyViolationDto {
    id: number;
    organization_id: number;
    organization_name?: string;
    start_time: Date;
    end_time: Date;
    duty_officer_name: string;
    reason: string;
    files?: FileResponse[];
    created_at: Date;
    created_by_user_id?: number;
}

export interface DutyViolationCreatePayload {
    organization_id: number;
    start_time: string; // ISO 8601
    end_time: string;   // ISO 8601
    duty_officer_name: string;
    reason: string;
    file_ids?: number[];
}

// PATCH uses the same shape as POST (UpdateDutyViolationRequest = CreateDutyViolationRequest).
export type DutyViolationUpdatePayload = DutyViolationCreatePayload;
