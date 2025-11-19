export interface Organization {
    id: number;
    name: string;
    parent_organization_id?: number | null;
    parent_organization?: string | null;
    types: string[];
    items?: Organization[];
}
