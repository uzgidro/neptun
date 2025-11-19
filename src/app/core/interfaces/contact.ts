import { Position } from '@/core/interfaces/position';
import { Department } from '@/core/interfaces/department';
import { Organization } from '@/core/interfaces/organizations';

export interface Contact {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    ip_phone?: string | null;

    dob?: string | null;

    external_organization_name?: string | null;

    organization?: Organization | null;
    department?: Department | null;
    position?: Position | null;
}

export interface AddContactRequest {
    name: string; // Обязательное поле
    email?: string | null;
    phone?: string | null;
    ip_phone?: string | null;
    dob?: string | null;
    external_organization_name?: string | null;
    organization_id?: number | null;
    department_id?: number | null;
    position_id?: number | null;
}

export interface EditContactRequest {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    ip_phone?: string | null;
    dob?: string | null;
    external_organization_name?: string | null;
    organization_id?: number | null;
    department_id?: number | null;
    position_id?: number | null;
}
