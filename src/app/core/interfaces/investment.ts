import { FileResponse } from '@/core/interfaces/files';

export interface InvestmentResponse {
    id: number;
    project_name: string;
    status: InvestmentStatus;
    amount: number;
    date: string;
    comment: string;
    files?: FileResponse[];
}

export interface InvestmentDto {
    id: number;
    project_name: string;
    status: InvestmentStatus;
    amount: number;
    date: Date;
    comment: string;
    files?: FileResponse[];
}

export interface InvestmentPayload {
    project_name: string;
    status: InvestmentStatus;
    amount: number;
    date: string;
    comment?: string;
}

export type InvestmentStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
    Planned: 'Запланировано',
    'In Progress': 'В процессе',
    Completed: 'Завершено',
    Cancelled: 'Отменено'
};
