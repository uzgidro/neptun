import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HRDocument, DocumentCreatePayload, DocumentRequest } from '@/core/interfaces/hrm/hr-documents';
import { HttpParams } from '@angular/common/http';

const HR_DOCUMENTS = '/hrm/hr-documents';

@Injectable({
    providedIn: 'root'
})
export class HRDocumentsService extends ApiService {
    // Documents
    getDocuments(params?: { status?: string; type?: string; category?: string; search?: string }): Observable<HRDocument[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        if (params?.category) httpParams = httpParams.set('category', params.category);
        if (params?.search) httpParams = httpParams.set('search', params.search);
        return this.http.get<HRDocument[]>(this.BASE_URL + HR_DOCUMENTS, { params: httpParams });
    }

    getDocument(id: number): Observable<HRDocument> {
        return this.http.get<HRDocument>(this.BASE_URL + HR_DOCUMENTS + '/' + id);
    }

    createDocument(payload: DocumentCreatePayload): Observable<HRDocument> {
        return this.http.post<HRDocument>(this.BASE_URL + HR_DOCUMENTS, payload);
    }

    updateDocument(id: number, data: Partial<HRDocument>): Observable<HRDocument> {
        return this.http.patch<HRDocument>(this.BASE_URL + HR_DOCUMENTS + '/' + id, data);
    }

    deleteDocument(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + HR_DOCUMENTS + '/' + id);
    }

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(this.BASE_URL + HR_DOCUMENTS + '/' + id + '/download', { responseType: 'blob' });
    }

    // Document Requests
    getRequests(): Observable<DocumentRequest[]> {
        return this.http.get<DocumentRequest[]>(this.BASE_URL + HR_DOCUMENTS + '/requests');
    }

    createRequest(data: Partial<DocumentRequest>): Observable<DocumentRequest> {
        return this.http.post<DocumentRequest>(this.BASE_URL + HR_DOCUMENTS + '/requests', data);
    }

    approveRequest(id: number): Observable<DocumentRequest> {
        return this.http.post<DocumentRequest>(this.BASE_URL + HR_DOCUMENTS + '/requests/' + id + '/approve', {});
    }

    rejectRequest(id: number, reason: string): Observable<DocumentRequest> {
        return this.http.post<DocumentRequest>(this.BASE_URL + HR_DOCUMENTS + '/requests/' + id + '/reject', { reason });
    }
}
