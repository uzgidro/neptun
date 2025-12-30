import { FileResponse } from '@/core/interfaces/files';

export interface InvestmentResponse {
    id: number;
    name: string;
    status: InvestmentStatus;
    cost: number;
    comments: string;
    files?: FileResponse[];
}

export interface InvestmentDto {
    id: number;
    name: string;
    status: InvestmentStatus;
    cost: number;
    comments: string;
    files?: FileResponse[];
}

export interface InvestmentStatus {
    id: number;
    name: string;
    description: string;
}
