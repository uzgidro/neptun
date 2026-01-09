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

export interface InvestmentStatus {
    id: number;
    name: string;
    description: string;
    display_order: number
}

export interface InvestmentType {
    id: number;
    name: string;
    description: string;
}
