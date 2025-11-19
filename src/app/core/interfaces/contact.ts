import { Position } from 'postcss';
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
