export interface Organization {
    // children: boolean;
    children: Organization[];
    id: number;
    name: string;
    parent_organization_id: number;
    parent_organization_name?: string;
    parent_organization: string;
    types: string[];
    items?: Organization[];
}
