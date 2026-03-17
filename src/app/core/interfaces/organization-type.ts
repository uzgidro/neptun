export interface OrganizationType {
    id: string;
    name: string;
    description?: string | null;
}

export interface OrganizationTypePayload {
    name: string;
    description?: string | null;
}
