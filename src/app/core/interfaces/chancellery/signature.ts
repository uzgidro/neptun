/**
 * Document signature interfaces for Chancellery document management system
 */

/** Types of documents that can be signed */
export type SignableDocumentType = 'decree' | 'report' | 'letter' | 'instruction';

/** Document pending signature from /documents/pending-signature endpoint */
export interface PendingDocument {
    document_type: SignableDocumentType;
    document_id: number;
    name: string;
    number?: string;
    document_date: string;
    type_id: number;
    type_name: string;
    organization?: string;
    organization_id?: number;
    responsible_name?: string;
    responsible_id?: number;
    created_at: string;
    created_by?: string;
}

/** Request body for signing a document POST /{docType}s/{id}/sign */
export interface SignDocumentRequest {
    resolution_text?: string;
    assigned_executor_id?: number;
    assigned_due_date?: string;
}

/** Response from sign/reject endpoints */
export interface SignatureResponse {
    status: 'OK';
    new_status?: {
        id: number;
        code: string;
        name: string;
    };
}

/** Request body for rejecting a signature POST /{docType}s/{id}/reject-signature */
export interface RejectSignatureRequest {
    reason?: string;
}

/** Signature history entry from /{docType}s/{id}/signatures endpoint */
export interface Signature {
    id: number;
    document_type: SignableDocumentType;
    document_id: number;
    action: 'signed' | 'rejected';
    resolution_text?: string;
    rejection_reason?: string;
    assigned_executor?: {
        id: number;
        name: string;
    };
    assigned_due_date?: string;
    signed_by?: {
        id: number;
        name: string;
    };
    signed_at: string;
}
