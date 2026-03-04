import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { HRDocument, DocumentRequest } from '@/core/interfaces/hrm/hr-documents';
import { HttpParams } from '@angular/common/http';

const HR_DOCUMENTS = '/hrm/hr-documents';
const USE_MOCK = !BASE_URL;

const MOCK_DOCUMENTS: HRDocument[] = [
    {
        id: 1, document_number: 'ПР-2026-001', title: 'Приказ о приёме на работу — Каримов Б.Р.', type: 'order', category: 'personnel',
        status: 'signed', employee_id: 1, employee_name: 'Каримов Бахтиёр Рустамович', department_id: 1, department_name: 'Чарвакская ГЭС',
        created_by: 10, created_by_name: 'HR Admin', created_at: '2026-01-15T10:30:00Z', requires_signature: true, version: 1, is_template: false,
        file_name: 'prikaz_001.pdf', file_size: 245000, file_type: 'application/pdf', tags: ['приём', 'кадры']
    },
    {
        id: 2, document_number: 'ТД-2026-015', title: 'Трудовой договор — Султанова Д.К.', type: 'employment_contract', category: 'personnel',
        status: 'signed', employee_id: 2, employee_name: 'Султанова Дилноза Камолидиновна', department_id: 5, department_name: 'Центральный аппарат',
        created_by: 10, created_by_name: 'HR Admin', created_at: '2026-01-20T14:00:00Z', valid_from: '2026-02-01', valid_until: '2027-02-01',
        requires_signature: true, version: 1, is_template: false, tags: ['договор', 'кадры']
    },
    {
        id: 3, document_number: 'СЗ-2026-042', title: 'Служебная записка о командировке', type: 'memo', category: 'administrative',
        status: 'pending_signature', employee_id: 3, employee_name: 'Рахимов Отабек Шухратович', department_id: 4, department_name: 'Фархадская ГЭС',
        created_by: 3, created_by_name: 'Рахимов О.Ш.', created_at: '2026-02-28T09:15:00Z', requires_signature: true, version: 1, is_template: false,
        signatures: [
            { id: 1, document_id: 3, signer_id: 10, signer_name: 'Исмаилов А.Б.', signer_position: 'Начальник отдела кадров', status: 'pending', order: 1 },
            { id: 2, document_id: 3, signer_id: 20, signer_name: 'Директор', signer_position: 'Генеральный директор', status: 'pending', order: 2 }
        ]
    },
    {
        id: 4, document_number: 'СПР-2026-008', title: 'Справка с места работы — Абдуллаев Ж.Т.', type: 'certificate', category: 'personnel',
        status: 'signed', employee_id: 4, employee_name: 'Абдуллаев Жасур Тохирович', department_id: 2, department_name: 'Ходжикентская ГЭС',
        created_by: 10, created_by_name: 'HR Admin', created_at: '2026-03-01T11:00:00Z', requires_signature: false, version: 1, is_template: false
    },
    {
        id: 5, document_number: 'ДС-2026-003', title: 'Доп. соглашение об изменении условий оплаты', type: 'contract_amendment', category: 'financial',
        status: 'draft', employee_id: 5, employee_name: 'Мирзаева Нодира Бахтиёровна', department_id: 5, department_name: 'Центральный аппарат',
        created_by: 10, created_by_name: 'HR Admin', created_at: '2026-03-02T16:30:00Z', requires_signature: true, version: 1, is_template: false
    },
    {
        id: 6, document_number: 'ПОЛ-2026-001', title: 'Положение об оплате труда', type: 'regulation', category: 'regulatory',
        status: 'signed', created_by: 20, created_by_name: 'Директор', created_at: '2026-01-10T08:00:00Z',
        valid_from: '2026-01-01', requires_signature: true, version: 3, is_template: false, tags: ['положение', 'оплата']
    }
];

const MOCK_REQUESTS: DocumentRequest[] = [
    {
        id: 1, document_type: 'certificate', employee_id: 4, employee_name: 'Абдуллаев Жасур Тохирович', department_name: 'Ходжикентская ГЭС',
        purpose: 'Для предоставления в банк', status: 'completed', requested_at: '2026-02-28T10:00:00Z',
        processed_at: '2026-03-01T11:00:00Z', processed_by: 10, processed_by_name: 'HR Admin', document_id: 4, copies_count: 2
    },
    {
        id: 2, document_type: 'certificate', employee_id: 1, employee_name: 'Каримов Бахтиёр Рустамович', department_name: 'Чарвакская ГЭС',
        purpose: 'Для посольства', status: 'pending', requested_at: '2026-03-03T14:00:00Z', copies_count: 1
    }
];

@Injectable({
    providedIn: 'root'
})
export class HRDocumentsService extends ApiService {
    getDocuments(params?: { status?: string; type?: string; category?: string; search?: string }): Observable<HRDocument[]> {
        if (USE_MOCK) {
            let result = [...MOCK_DOCUMENTS];
            if (params?.status) result = result.filter(d => d.status === params.status);
            if (params?.type) result = result.filter(d => d.type === params.type);
            if (params?.category) result = result.filter(d => d.category === params.category);
            if (params?.search) result = result.filter(d => d.title.toLowerCase().includes(params.search!.toLowerCase()));
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        if (params?.category) httpParams = httpParams.set('category', params.category);
        if (params?.search) httpParams = httpParams.set('search', params.search);
        return this.http.get<HRDocument[]>(BASE_URL + HR_DOCUMENTS, { params: httpParams });
    }

    getDocument(id: number): Observable<HRDocument> {
        if (USE_MOCK) return of(MOCK_DOCUMENTS.find(d => d.id === id) || MOCK_DOCUMENTS[0]).pipe(delay(150));
        return this.http.get<HRDocument>(BASE_URL + HR_DOCUMENTS + '/' + id);
    }

    createDocument(formData: FormData): Observable<HRDocument> {
        if (USE_MOCK) return of({ ...MOCK_DOCUMENTS[0], id: Date.now() }).pipe(delay(200));
        return this.http.post<HRDocument>(BASE_URL + HR_DOCUMENTS, formData);
    }

    updateDocument(id: number, data: Partial<HRDocument>): Observable<HRDocument> {
        if (USE_MOCK) return of({ ...MOCK_DOCUMENTS[0], ...data, id } as HRDocument).pipe(delay(200));
        return this.http.patch<HRDocument>(BASE_URL + HR_DOCUMENTS + '/' + id, data);
    }

    deleteDocument(id: number): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.delete(BASE_URL + HR_DOCUMENTS + '/' + id);
    }

    downloadDocument(id: number): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock document'], { type: 'application/pdf' })).pipe(delay(200));
        return this.http.get(BASE_URL + HR_DOCUMENTS + '/' + id + '/download', { responseType: 'blob' });
    }

    getRequests(): Observable<DocumentRequest[]> {
        if (USE_MOCK) return of(MOCK_REQUESTS).pipe(delay(200));
        return this.http.get<DocumentRequest[]>(BASE_URL + HR_DOCUMENTS + '/requests');
    }

    createRequest(data: Partial<DocumentRequest>): Observable<DocumentRequest> {
        if (USE_MOCK) return of({ ...MOCK_REQUESTS[1], ...data, id: Date.now() } as DocumentRequest).pipe(delay(200));
        return this.http.post<DocumentRequest>(BASE_URL + HR_DOCUMENTS + '/requests', data);
    }

    approveRequest(id: number): Observable<DocumentRequest> {
        if (USE_MOCK) return of({ ...MOCK_REQUESTS[0], id, status: 'completed' as const }).pipe(delay(200));
        return this.http.post<DocumentRequest>(BASE_URL + HR_DOCUMENTS + '/requests/' + id + '/approve', {});
    }

    rejectRequest(id: number, reason: string): Observable<DocumentRequest> {
        if (USE_MOCK) return of({ ...MOCK_REQUESTS[1], id, status: 'rejected' as const, rejection_reason: reason } as DocumentRequest).pipe(delay(200));
        return this.http.post<DocumentRequest>(BASE_URL + HR_DOCUMENTS + '/requests/' + id + '/reject', { reason });
    }
}
