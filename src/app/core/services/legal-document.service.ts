import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@/core/services/config.service';
import {
    LegalDocument,
    LegalDocumentPayload,
    LegalDocumentFilters,
    LegalDocumentType,
    CreateLegalDocumentResponse,
    LexSearchResponse
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
    private configService = inject(ConfigService);

    private get apiUrl(): string {
        return `${this.configService.apiBaseUrl}/legal-documents`;
    }

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
     * Create new document with JSON payload
     */
    create(payload: LegalDocumentPayload): Observable<CreateLegalDocumentResponse> {
        return this.http.post<CreateLegalDocumentResponse>(this.apiUrl, payload);
    }

    /**
     * Update existing document with JSON payload
     */
    update(id: number, payload: Partial<LegalDocumentPayload>): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, payload);
    }

    /**
     * Delete document
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Search documents on Lex.uz
     */
    searchLex(searchTitle: string, page: number = 1): Observable<LexSearchResponse> {
        const params = new HttpParams()
            .set('searchtitle', searchTitle)
            .set('page', page.toString());

        return this.http.get<LexSearchResponse>(`${this.configService.apiBaseUrl}/lex-search`, { params });
    }
}
