import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
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
export abstract class BaseDocumentService<T extends DocumentResponse = DocumentResponse, P extends DocumentPayload = DocumentPayload, F extends DocumentFilters = DocumentFilters> {
    protected http = inject(HttpClient);

    protected abstract readonly endpoint: string;

    protected get apiUrl(): string {
        return this.endpoint;
    }

    getAll(filters?: F): Observable<T[]> {
        return of([] as T[]).pipe(delay(100));
    }

    getById(id: number): Observable<T> {
        return of({ id } as any as T).pipe(delay(100));
    }

    create(payload: P | FormData): Observable<CreateDocumentResponse> {
        return of({ id: Date.now() } as CreateDocumentResponse).pipe(delay(200));
    }

    update(id: number, payload: Partial<P> | FormData): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }

    delete(id: number): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }

    getTypes(): Observable<DocumentType[]> {
        return of([]).pipe(delay(100));
    }

    getHistory(id: number): Observable<StatusHistoryEntry[]> {
        return of([]).pipe(delay(100));
    }

    changeStatus(id: number, request: ChangeStatusRequest): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }

    signDocument(id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return of({ success: true } as any).pipe(delay(200));
    }

    rejectSignature(id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return of({ success: true } as any).pipe(delay(200));
    }

    getSignatures(id: number): Observable<Signature[]> {
        return of([]).pipe(delay(100));
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
            files.forEach((file) => formData.append('files', file, file.name));
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
