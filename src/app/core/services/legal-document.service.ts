import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    LegalDocument,
    LegalDocumentPayload,
    LegalDocumentFilters,
    LegalDocumentType,
    CreateLegalDocumentResponse,
    LexSearchResponse
} from '@/core/interfaces/chancellery';

// Мок-данные типов документов
const MOCK_DOC_TYPES: LegalDocumentType[] = [
    { id: 1, name: 'Устав', description: 'Учредительные документы' },
    { id: 2, name: 'Положение', description: 'Регламентирующие документы' },
    { id: 3, name: 'Инструкция', description: 'Инструктивные документы' },
    { id: 4, name: 'Приказ', description: 'Распорядительные документы' },
    { id: 5, name: 'Договор', description: 'Договорные документы' }
];

// Мок-данные правовых документов
const MOCK_LEGAL_DOCS: LegalDocument[] = [
    {
        id: 1,
        name: 'Устав АО "МолокоПром"',
        number: 'УС-001',
        document_date: '2020-01-15',
        type: MOCK_DOC_TYPES[0],
        files: [{ id: 1, name: 'ustav.pdf', original_name: 'Устав_МолокоПром.pdf', mime_type: 'application/pdf', size: 524288, url: '/files/1' }],
        created_at: '2020-01-15T10:00:00Z'
    },
    {
        id: 2,
        name: 'Положение о производственном контроле',
        number: 'ПК-045',
        document_date: '2023-03-20',
        type: MOCK_DOC_TYPES[1],
        files: [{ id: 2, name: 'control.pdf', original_name: 'Положение_контроль.pdf', mime_type: 'application/pdf', size: 245760, url: '/files/2' }],
        created_at: '2023-03-20T14:30:00Z'
    },
    {
        id: 3,
        name: 'Инструкция по охране труда',
        number: 'ОТ-112',
        document_date: '2024-01-10',
        type: MOCK_DOC_TYPES[2],
        files: [],
        created_at: '2024-01-10T09:00:00Z'
    }
];

@Injectable({
    providedIn: 'root'
})
export class LegalDocumentService {
    private http = inject(HttpClient);

    getAll(filters?: LegalDocumentFilters): Observable<LegalDocument[]> {
        let result = [...MOCK_LEGAL_DOCS];
        if (filters?.type_id) {
            result = result.filter(d => d.type.id === filters.type_id);
        }
        return of(result).pipe(delay(200));
    }

    getById(id: number): Observable<LegalDocument> {
        const doc = MOCK_LEGAL_DOCS.find(d => d.id === id) || MOCK_LEGAL_DOCS[0];
        return of(doc).pipe(delay(200));
    }

    getTypes(): Observable<LegalDocumentType[]> {
        return of(MOCK_DOC_TYPES).pipe(delay(200));
    }

    create(payload: LegalDocumentPayload | FormData): Observable<CreateLegalDocumentResponse> {
        return of({ status: 'Created', id: Date.now() } as CreateLegalDocumentResponse).pipe(delay(300));
    }

    update(id: number, payload: Partial<LegalDocumentPayload> | FormData): Observable<void> {
        return of(undefined).pipe(delay(300));
    }

    delete(id: number): Observable<void> {
        return of(undefined).pipe(delay(200));
    }

    buildFormData(
        payload: Partial<LegalDocumentPayload>,
        files?: File[],
        existingFileIds?: number[]
    ): FormData {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'file_ids') return;

            if (value instanceof Date) {
                formData.append(key, this.formatDate(value));
            } else {
                formData.append(key, String(value));
            }
        });

        if (existingFileIds !== undefined) {
            formData.append('file_ids', existingFileIds.join(','));
        }

        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file, file.name);
            });
        }

        return formData;
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    searchLex(searchTitle: string, page: number = 1): Observable<LexSearchResponse> {
        // Мок поиска по Lex.uz
        const mockResponse: LexSearchResponse = {
            documents: [
                { number: 7719581, title: `Результат поиска: ${searchTitle}`, url: '/ru/docs/7719581', badge: 'Закон № 123', status: 'active' },
                { number: 7719582, title: 'О качестве и безопасности пищевой продукции', url: '/ru/docs/7719582', badge: 'Закон № 456', status: 'active' }
            ],
            current_page: page,
            total_pages: 1
        };
        return of(mockResponse).pipe(delay(300));
    }
}
