import { UserShortInfo } from '@/core/interfaces/users';

export interface VisitFile {
    id: number;
    filename: string;
    object_key: string;
    mime_type: string;
    size: number;
    created_at: string;
}

export interface AddVisitRequest {
    organization_id: number;
    visit_date: string;
    description: string;
    responsible_name: string;
}

export interface EditVisitRequest {
    organization_id?: number | null;
    visit_date?: string | null;
    description?: string | null;
    responsible_name?: string | null;
}

export interface VisitResponse {
    id: number;
    organization_id: number;
    organization_name: string;
    visit_date: string; // <-- строка
    description: string;
    responsible_name: string;
    created_at: string; // <-- строка
    created_by: UserShortInfo;
    files?: VisitFile[];
}

export interface VisitDto {
    id: number;
    organization_id: number;
    organization_name: string;
    visit_date: Date;
    description: string;
    responsible_name: string;
    created_at: Date;
    created_by: UserShortInfo;
    files?: VisitFile[];
}
