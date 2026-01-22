import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
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

// Мок-данные типов документов
const MOCK_DOC_TYPES: DocumentType[] = [
    { id: 1, name: 'Приказ' },
    { id: 2, name: 'Распоряжение' },
    { id: 3, name: 'Служебная записка' },
    { id: 4, name: 'Письмо' }
] as DocumentType[];

const MOCK_HISTORY: StatusHistoryEntry[] = [
    { id: 1, status: 'created', changed_by: 'Администратор', changed_at: new Date().toISOString(), comment: 'Документ создан' },
    { id: 2, status: 'in_review', changed_by: 'Администратор', changed_at: new Date().toISOString(), comment: 'Отправлен на рассмотрение' }
] as StatusHistoryEntry[];

const MOCK_SIGNATURES: Signature[] = [
    { id: 1, signer_name: 'Иванов И.И.', signed_at: new Date().toISOString(), status: 'signed' }
] as Signature[];

/**
 * Abstract base service for all chancellery document types.
 * Mocked version - returns static data.
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
        return of([] as T[]).pipe(delay(200));
    }

    getById(id: number): Observable<T> {
        return of({} as T).pipe(delay(200));
    }

    create(payload: P | FormData): Observable<CreateDocumentResponse> {
        return of({ id: Date.now() } as CreateDocumentResponse).pipe(delay(300));
    }

    update(id: number, payload: Partial<P> | FormData): Observable<void> {
        return of(undefined).pipe(delay(300));
    }

    delete(id: number): Observable<void> {
        return of(undefined).pipe(delay(200));
    }

    getTypes(): Observable<DocumentType[]> {
        return of(MOCK_DOC_TYPES).pipe(delay(200));
    }

    getHistory(id: number): Observable<StatusHistoryEntry[]> {
        return of(MOCK_HISTORY).pipe(delay(200));
    }

    changeStatus(id: number, request: ChangeStatusRequest): Observable<void> {
        return of(undefined).pipe(delay(300));
    }

    signDocument(id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return of({ success: true, message: 'Документ подписан' } as SignatureResponse).pipe(delay(300));
    }

    rejectSignature(id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return of({ success: true, message: 'Подпись отклонена' } as SignatureResponse).pipe(delay(300));
    }

    getSignatures(id: number): Observable<Signature[]> {
        return of(MOCK_SIGNATURES).pipe(delay(200));
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
                // Skip
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
