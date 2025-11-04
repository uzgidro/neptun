export interface Organization {
    id: number;
    name: string;
    parent_organization_id: number;
    parent_organization: string;
    types: string[];
    items?: Organization[];
}
