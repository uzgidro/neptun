/**
 * Base interfaces for Chancellery document management system
 * All document types (Decrees, Reports, Letters, Instructions) share these base interfaces
 */

/** Document type reference */
export interface DocumentType {
    id: number;
    name: string;
    description?: string;
}

/** Short contact reference */
export interface ContactShort {
    id: number;
    name: string;
}

/** Short organization reference */
export interface OrganizationShort {
    id: number;
    name: string;
}

/** Short user reference */
export interface UserShort {
    id: number;
    name: string;
}

/** Parent document reference */
export interface ParentDocumentShort {
    id: number;
    name: string;
    number?: string;
    document_date?: string;
}

/** File attachment in API response */
export interface FileResponse {
    id: number;
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string; // presigned URL for download
}

/** Types of documents that can be linked */
export type LinkedDocumentType = 'decree' | 'report' | 'letter' | 'instruction' | 'legal_document';

/** Linked document in API response */
export interface DocumentLink {
    id: number;
    document_type: LinkedDocumentType;
    document_id: number;
    document_name: string;
    document_number?: string;
    link_description?: string;
}

/** Linked document for create/update request */
export interface LinkedDocumentRequest {
    linked_document_type: LinkedDocumentType;
    linked_document_id: number;
    link_description?: string;
}

/** Base document response structure (shared by all document types) */
export interface DocumentResponse {
    id: number;
    name: string;
    number?: string;
    document_date: string; // ISO date "YYYY-MM-DD"
    description?: string;
    type: DocumentType;
    status: DocumentStatusShort;
    responsible_contact?: ContactShort;
    organization?: OrganizationShort;
    executor_contact?: ContactShort;
    due_date?: string;
    parent_document?: ParentDocumentShort;
    created_at: string; // ISO datetime
    created_by?: UserShort;
    updated_at?: string;
    updated_by?: UserShort;
    files: FileResponse[];
    linked_documents: DocumentLink[];
}

/** Short status reference in document response */
export interface DocumentStatusShort {
    id: number;
    code: string;
    name: string;
}

/** Base document payload for create/update */
export interface DocumentPayload {
    name: string;
    document_date: string; // YYYY-MM-DD
    type_id: number;
    number?: string;
    description?: string;
    status_id?: number;
    responsible_contact_id?: number;
    organization_id?: number;
    executor_contact_id?: number;
    due_date?: string;
    parent_document_id?: number;
    file_ids?: number[];
    linked_documents?: LinkedDocumentRequest[];
}

/** Filter parameters for document list */
export interface DocumentFilters {
    type_id?: number;
    status_id?: number;
    organization_id?: number;
    responsible_contact_id?: number;
    executor_contact_id?: number;
    start_date?: string; // YYYY-MM-DD
    end_date?: string;
    due_date_from?: string;
    due_date_to?: string;
    name_search?: string; // ILIKE search
    number_search?: string; // ILIKE search
}

/** API response for document creation */
export interface CreateDocumentResponse {
    status: 'Created';
    id: number;
    uploaded_files?: Array<{
        id: number;
        name: string;
        size: number;
    }>;
}

/** Generic API response */
export interface ApiResponse {
    status: 'OK' | 'Created' | 'Bad Request' | 'Not Found' | 'Internal Server Error';
    message?: string;
}

/** Validation error response */
export interface ValidationError {
    status: 'Bad Request';
    errors: Array<{
        field: string;
        message: string;
    }>;
}
