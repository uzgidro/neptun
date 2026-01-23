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

/**
 * Abstract base service for all chancellery document types.
 * Provides common CRUD operations and status management.
 */
export abstract class BaseDocumentService<
    T extends DocumentResponse = DocumentResponse,
    P extends DocumentPayload = DocumentPayload,
    F extends DocumentFilters = DocumentFilters
> {
    protected http = inject(HttpClient);

    protected abstract readonly endpoint: string;

    protected get apiUrl(): string {
        return this.endpoint;
    }

    getAll(filters?: F): Observable<T[]> {
        let params = new HttpParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params = params.append(key, String(value));
                }
            });
        }

        return this.http.get<T[]>(this.apiUrl, { params });
    }

    getById(id: number): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${id}`);
    }

    create(payload: P | FormData): Observable<CreateDocumentResponse> {
        return this.http.post<CreateDocumentResponse>(this.apiUrl, payload);
    }

    update(id: number, payload: Partial<P> | FormData): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTypes(): Observable<DocumentType[]> {
        return this.http.get<DocumentType[]>(`${this.apiUrl}/types`);
    }

    getHistory(id: number): Observable<StatusHistoryEntry[]> {
        return this.http.get<StatusHistoryEntry[]>(`${this.apiUrl}/${id}/history`);
    }

    changeStatus(id: number, request: ChangeStatusRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/status`, request);
    }

    signDocument(id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.apiUrl}/${id}/sign`, request);
    }

    rejectSignature(id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.apiUrl}/${id}/reject`, request);
    }

    getSignatures(id: number): Observable<Signature[]> {
        return this.http.get<Signature[]>(`${this.apiUrl}/${id}/signatures`);
    }

    getStatusSeverity(code: string): StatusSeverity {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.severity ?? 'secondary';
    }

    getStatusIcon(code: string): string {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.icon ?? 'pi pi-file';
    }

    buildFormData(payload: Partial<P>, files?: File[], existingFileIds?: number[]): FormData {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'linked_documents' && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (key === 'file_ids') {
                // Skip - handled separately below
            } else if (value instanceof Date) {
                formData.append(key, this.formatDate(value));
            } else {
                formData.append(key, String(value));
            }
        });

        if (existingFileIds !== undefined) {
            formData.append('file_ids', existingFileIds.join(','));
        }

        if (files && files.length > 0) {
            files.forEach(file => formData.append('files', file, file.name));
        }

        return formData;
    }

    protected formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    protected parseDate(dateStr: string): Date {
        return new Date(dateStr);
    }
}
