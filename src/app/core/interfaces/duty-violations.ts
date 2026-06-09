import { FileResponse } from '@/core/interfaces/files';

export interface DutyViolationResponse {
    id: number;
    organization_id: number;
    organization_name?: string;
    start_time: string;      // ISO 8601
    end_time: string | null; // ISO 8601, null for an open shift
    duty_officer_name: string;
    reason: string;
    files?: FileResponse[];
    created_at: string;
    created_by_user_id?: number;
    updated_at: string;
}

// GET /duty-violations returns records grouped by organization.
// Groups sorted by name ASC; within a group records sorted start_time DESC, id DESC.
export interface DutyViolationGroupResponse {
    id: number;     // organization_id
    name: string;   // organization_name
    violations: DutyViolationResponse[];
}

export interface DutyViolationDto {
    id: number;
    organization_id: number;
    organization_name?: string;
    start_time: Date;
    end_time: Date | null;
    duty_officer_name: string;
    reason: string;
    files?: FileResponse[];
    created_at: Date;
    created_by_user_id?: number;
}

export interface DutyViolationCreatePayload {
    organization_id: number;
    start_time: string;          // ISO 8601
    end_time?: string | null;    // ISO 8601; omit (create) or null (edit) = ongoing
    duty_officer_name: string;
    reason: string;
    file_ids?: number[];
}

// PATCH uses the same shape as POST (UpdateDutyViolationRequest = CreateDutyViolationRequest).
export type DutyViolationUpdatePayload = DutyViolationCreatePayload;
