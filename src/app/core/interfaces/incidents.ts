export interface IncidentPayload {
    organization_id?: number;
    incident_time?: string;
    description?: string;
}

export interface IncidentResponse {
    id: number;
    incident_date: string;
    description: string | null;
    created_at: string;
    organization_id: number;
    organization: string;
    created_by_user_id: number;
    created_by_user: string;
}
