/**
 * Legal Document Library (Нормативно-правовая библиотека) interfaces
 * Endpoint: /legal-documents
 *
 * Simplified structure compared to chancellery documents:
 * - NO status workflow
 * - NO history tracking
 * - NO linked documents
 * - NO responsible contacts/organizations
 */

import { FileResponse, UserShort } from './document-base';

/** Legal document type */
export interface LegalDocumentType {
    id: number;
    name: string;
    description?: string;
}

/** Legal document response from API */
export interface LegalDocument {
    id: number;
    name: string;
    number?: string;
    document_date: string; // ISO date "YYYY-MM-DD"
    type: LegalDocumentType;
    files: FileResponse[];
    created_at: string; // ISO datetime
    created_by?: UserShort;
    updated_at?: string;
    updated_by?: UserShort;
}

/** Legal document creation/update payload */
export interface LegalDocumentPayload {
    name: string;
    number?: string;
    document_date: string; // YYYY-MM-DD
    type_id: number;
    file_ids?: number[];
}

/** Legal document filter parameters */
export interface LegalDocumentFilters {
    type_id?: number;
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
    name?: string; // ILIKE search
    number?: string; // ILIKE search
}

/** API response for legal document creation */
export interface CreateLegalDocumentResponse {
    status: 'Created';
    id: number;
    uploaded_files?: Array<{
        id: number;
        name: string;
        size: number;
    }>;
}
