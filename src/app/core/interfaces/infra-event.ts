export interface InfraEventFile {
    id: number;
    file_name: string;
    url: string;
    mime_type: string;
    size_bytes: number;
}

export interface InfraEventCategory {
    id: number;
    slug: string;
    display_name: string;
    label: string;
    sort_order: number;
    created_at: string;
}

export interface InfraEventCategoryPayload {
    slug: string;
    display_name: string;
    label: string;
    sort_order?: number;
}

export interface InfraEvent {
    id: number;
    category_id: number;
    category_slug: string;
    category_name: string;
    organization_id: number;
    organization_name: string;
    occurred_at: string;
    restored_at: string | null;
    description: string;
    remediation: string | null;
    notes: string | null;
    created_at: string;
    created_by: { id: number; name: string };
    files: InfraEventFile[];
}

export interface InfraEventCreatePayload {
    category_id: number;
    organization_id: number;
    occurred_at: string;
    restored_at?: string | null;
    description: string;
    remediation?: string;
    notes?: string;
    file_ids?: number[];
}

export interface InfraEventUpdatePayload {
    category_id?: number;
    organization_id?: number;
    occurred_at?: string;
    restored_at?: string;
    clear_restored_at?: boolean;
    description?: string;
    remediation?: string;
    notes?: string;
    file_ids?: number[];
}
