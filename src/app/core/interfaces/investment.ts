import { FileResponse } from '@/core/interfaces/files';

export interface InvestmentResponse {
    id: number;
    name: string;
    status: InvestmentStatus;
    type: InvestmentType;
    cost: number;
    comments: string;
    files?: FileResponse[];
}

export interface InvestmentDto {
    id: number;
    name: string;
    status: InvestmentStatus;
    type: InvestmentType;
    cost: number;
    comments: string;
    files?: FileResponse[];
}

export interface InvestmentCreatePayload {
    name: string;
    status_id: number;
    type_id: number;
    cost: number;
    comments?: string;
    file_ids?: number[];
}

export interface InvestmentUpdatePayload {
    name?: string;
    status_id?: number;
    type_id?: number;
    cost?: number;
    comments?: string;
    file_ids?: number[];
}

export interface InvestmentStatus {
    id: number;
    name: string;
    description: string;
    display_order: number;
}

export interface InvestmentType {
    id: number;
    name: string;
    description: string;
}
