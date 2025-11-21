import { Organization } from '@/core/interfaces/organizations';

export interface DepartmentPayload {
    name: string;
    description?: string;
    organization_id: number;
}

export interface Department {
    id: number;
    name: string;
    description?: string | null;
    organization_id: number;
    organization?: Organization | null;
}

export interface DepartmentPayload {
    name: string;
    description?: string;
    organization_id: number;
}
