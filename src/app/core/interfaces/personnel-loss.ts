import { Organization } from './organizations';
import { Department } from './department';
import { Position } from './position';

export type LossType = 'dismissal' | 'death' | 'retirement' | 'transfer' | 'other';

export interface PersonnelLoss {
    id: number;
    name: string;
    photo?: string | null;
    position?: Position | null;
    department?: Department | null;
    organization?: Organization | null;
    lossType: LossType;
    lossDate: string;
    hireDate?: string | null;
    reason?: string | null;
    yearsOfService?: number | null;
    achievements?: string | null;
    notes?: string | null;
}

export interface PersonnelLossPayload {
    name: string;
    photo?: string | null;
    position_id?: number | null;
    department_id?: number | null;
    organization_id?: number | null;
    lossType: LossType;
    lossDate: string;
    hireDate?: string | null;
    reason?: string | null;
    achievements?: string | null;
    notes?: string | null;
}

export interface PersonnelLossStats {
    total: number;
    thisYear: number;
    dismissals: number;
    deaths: number;
    retirements: number;
    transfers: number;
    other: number;
    byMonth: { month: string; count: number }[];
}
