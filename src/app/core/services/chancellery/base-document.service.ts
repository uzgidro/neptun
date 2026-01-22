import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    DocumentResponse,
    DocumentPayload,
    DocumentFilters,
    DocumentType,
    CreateDocumentResponse
} from '@/core/interfaces/chancellery/document-base';
import {
    StatusHistoryEntry,
    ChangeStatusRequest,
    StatusCode,
    StatusSeverity,
    STATUS_DISPLAY_CONFIG
} from '@/core/interfaces/chancellery/document-status';
import {
    SignDocumentRequest,
    SignatureResponse,
    RejectSignatureRequest,
    Signature
} from '@/core/interfaces/chancellery/signature';
import { BASE_URL } from '@/core/services/api.service';

/**
 * Abstract base service for all chancellery document types.
 * Provides common CRUD operations, status management, and file handling.
 *
 * @template T - Document response type (extends DocumentResponse)
 * @template P - Document payload type (extends DocumentPayload)
 * @template F - Document filters type (extends DocumentFilters)
 */
export abstract class BaseDocumentService<
    T extends DocumentResponse = DocumentResponse,
    P extends DocumentPayload = DocumentPayload,
    F extends DocumentFilters = DocumentFilters
> {
    protected http = inject(HttpClient);

    /** API endpoint path without base URL (e.g., '/decrees') */
    protected abstract readonly endpoint: string;

    /** Full API URL for this document type */
    protected get apiUrl(): string {
        return `${BASE_URL}${this.endpoint}`;
    }

    // =========================================================================
    // CRUD Operations
    // =========================================================================

    /**
     * Get all documents with optional filters
     */
    getAll(filters?: F): Observable<T[]> {
        let params = new HttpParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params = params.set(key, String(value));
                }
            });
        }

        return this.http.get<T[]>(this.apiUrl, { params });
    }

    /**
     * Get document by ID
     */
    getById(id: number): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create new document
     * Supports both JSON payload and FormData (for file uploads)
     */
    create(payload: P | FormData): Observable<CreateDocumentResponse> {
        return this.http.post<CreateDocumentResponse>(this.apiUrl, payload);
    }

    /**
     * Update existing document
     * Supports both JSON payload and FormData (for file uploads)
     */
    update(id: number, payload: Partial<P> | FormData): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, payload);
    }

    /**
     * Delete document
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // =========================================================================
    // Document Types Reference
    // =========================================================================

    /**
     * Get available document types for this document category
     */
    getTypes(): Observable<DocumentType[]> {
        return this.http.get<DocumentType[]>(`${this.apiUrl}/types`);
    }

    // =========================================================================
    // Status Management
    // =========================================================================

    /**
     * Get status change history for a document
     */
    getHistory(id: number): Observable<StatusHistoryEntry[]> {
        return this.http.get<StatusHistoryEntry[]>(`${this.apiUrl}/${id}/history`);
    }

    /**
     * Change document status with optional comment
     */
    changeStatus(id: number, request: ChangeStatusRequest): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/status`, request);
    }

    // =========================================================================
    // Signature Operations
    // =========================================================================

    /**
     * Sign a document with optional resolution
     */
    signDocument(id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.apiUrl}/${id}/sign`, request);
    }

    /**
     * Reject a document signature with optional reason
     */
    rejectSignature(id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.apiUrl}/${id}/reject-signature`, request);
    }

    /**
     * Get signature history for a document
     */
    getSignatures(id: number): Observable<Signature[]> {
        return this.http.get<Signature[]>(`${this.apiUrl}/${id}/signatures`);
    }

    // =========================================================================
    // UI Helpers
    // =========================================================================

    /**
     * Get severity class for status (for PrimeNG Tag component)
     */
    getStatusSeverity(code: string): StatusSeverity {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.severity ?? 'secondary';
    }

    /**
     * Get icon class for status
     */
    getStatusIcon(code: string): string {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.icon ?? 'pi pi-file';
    }

    // =========================================================================
    // FormData Builder
    // =========================================================================

    /**
     * Build FormData from payload and files for multipart upload
     *
     * @param payload - Document payload
     * @param files - Files to upload (optional)
     * @param existingFileIds - IDs of existing files to keep (optional)
     */
    buildFormData(payload: Partial<P>, files?: File[], existingFileIds?: number[]): FormData {
        const formData = new FormData();

        // Add payload fields
        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }

            if (key === 'linked_documents' && Array.isArray(value)) {
                // Serialize linked documents as JSON
                formData.append(key, JSON.stringify(value));
            } else if (key === 'file_ids') {
                // Skip - handled separately below
            } else if (value instanceof Date) {
                formData.append(key, this.formatDate(value));
            } else {
                formData.append(key, String(value));
            }
        });

        // Add existing file IDs
        if (existingFileIds !== undefined) {
            formData.append('file_ids', existingFileIds.join(','));
        }

        // Add new files
        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file, file.name);
            });
        }

        return formData;
    }

    /**
     * Format date to YYYY-MM-DD string
     */
    protected formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Parse date string to Date object
     */
    protected parseDate(dateStr: string): Date {
        return new Date(dateStr);
    }
}
