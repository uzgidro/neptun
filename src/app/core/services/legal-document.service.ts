import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from './api.service';
import {
    LegalDocument,
    LegalDocumentPayload,
    LegalDocumentFilters,
    LegalDocumentType,
    CreateLegalDocumentResponse
} from '@/core/interfaces/chancellery';

/**
 * Service for Legal Documents Library (Нормативно-правовая библиотека)
 * Simplified service - no status workflow, no history
 *
 * Endpoint: /legal-documents
 */
@Injectable({
    providedIn: 'root'
})
export class LegalDocumentService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${BASE_URL}/legal-documents`;

    /**
     * Get all legal documents with optional filters
     */
    getAll(filters?: LegalDocumentFilters): Observable<LegalDocument[]> {
        let params = new HttpParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params = params.set(key, String(value));
                }
            });
        }

        return this.http.get<LegalDocument[]>(this.apiUrl, { params });
    }

    /**
     * Get document by ID
     */
    getById(id: number): Observable<LegalDocument> {
        return this.http.get<LegalDocument>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get available legal document types
     */
    getTypes(): Observable<LegalDocumentType[]> {
        return this.http.get<LegalDocumentType[]>(`${this.apiUrl}/types`);
    }

    /**
     * Create new document (supports multipart/form-data)
     */
    create(payload: LegalDocumentPayload | FormData): Observable<CreateLegalDocumentResponse> {
        return this.http.post<CreateLegalDocumentResponse>(this.apiUrl, payload);
    }

    /**
     * Update existing document
     */
    update(id: number, payload: Partial<LegalDocumentPayload> | FormData): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, payload);
    }

    /**
     * Delete document
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Build FormData from payload and files for multipart upload
     */
    buildFormData(
        payload: Partial<LegalDocumentPayload>,
        files?: File[],
        existingFileIds?: number[]
    ): FormData {
        const formData = new FormData();

        // Add payload fields
        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'file_ids') return; // handled separately

            if (value instanceof Date) {
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
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
