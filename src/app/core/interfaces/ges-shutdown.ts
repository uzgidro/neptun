import { UserShortInfo } from '@/core/interfaces/users';
import { FileResponse } from '@/core/interfaces/files';

export interface GesShutdownPayload {
    organization_id?: number;
    start_time?: string;
    end_time?: string;
    reason?: string;
    generation_loss?: string;
    idle_discharge_volume?: number;
}

export interface ShutdownResponse {
    id: number;
    organization_id: number;
    organization_name: string;
    started_at: string;
    ended_at: string | null;
    reason: string | null;
    created_by: UserShortInfo;
    generation_loss: number | null;
    created_at: string;
    idle_discharge_volume: number | null;
    files?: FileResponse[];
    viewed: boolean;
}

export interface GesShutdownResponse {
    ges: ShutdownResponse[];
    mini: ShutdownResponse[];
    micro: ShutdownResponse[];
}

export interface ShutdownDto {
    id: number;
    organization_id: number;
    organization_name: string;
    started_at: Date;
    ended_at: Date | null;
    reason: string | null;
    created_by: UserShortInfo;
    generation_loss: number | null;
    created_at: Date;
    idle_discharge_volume: number | null;
    files?: FileResponse[];
    viewed: boolean;
}

export interface GesShutdownDto {
    ges: ShutdownDto[];
    mini: ShutdownDto[];
    micro: ShutdownDto[];
}
