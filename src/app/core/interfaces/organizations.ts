import { Contact } from '@/core/interfaces/contact';
import { AscueMetricsDto } from '@/core/interfaces/ascue';

export interface Organization {
    id: number;
    name: string;
    parent_organization_id?: number | null;
    parent_organization?: string | null;
    types?: string[];
    items?: Organization[];
    current_discharge?: number | null;
    contacts: Contact[];
    ascue_metrics?: AscueMetricsDto;
}

export interface OrganizationPayload {
    name: string;
    parent_organization_id?: number | null;
}
