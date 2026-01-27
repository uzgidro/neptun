import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HRDocument, DocumentRequest } from '@/core/interfaces/hrm/hr-documents';

const HR_DOCUMENTS = '/hr-documents';

@Injectable({
    providedIn: 'root'
})
export class HRDocumentsService extends ApiService {
    // Documents
    getDocuments(): Observable<HRDocument[]> {
        return this.http.get<HRDocument[]>(BASE_URL + HR_DOCUMENTS);
    }

    getDocument(id: number): Observable<HRDocument> {
        return this.http.get<HRDocument>(BASE_URL + HR_DOCUMENTS + '/' + id);
    }

    createDocument(formData: FormData): Observable<HRDocument> {
        return this.http.post<HRDocument>(BASE_URL + HR_DOCUMENTS, formData);
    }

    updateDocument(id: number, data: Partial<HRDocument>): Observable<HRDocument> {
        return this.http.patch<HRDocument>(BASE_URL + HR_DOCUMENTS + '/' + id, data);
    }

    deleteDocument(id: number): Observable<any> {
        return this.http.delete(BASE_URL + HR_DOCUMENTS + '/' + id);
    }

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(BASE_URL + HR_DOCUMENTS + '/' + id + '/download', { responseType: 'blob' });
    }

    // Document Requests
    getRequests(): Observable<DocumentRequest[]> {
        return this.http.get<DocumentRequest[]>(BASE_URL + HR_DOCUMENTS + '/requests');
    }

    createRequest(data: Partial<DocumentRequest>): Observable<DocumentRequest> {
        return this.http.post<DocumentRequest>(BASE_URL + HR_DOCUMENTS + '/requests', data);
    }

    approveRequest(id: number): Observable<DocumentRequest> {
        return this.http.post<DocumentRequest>(BASE_URL + HR_DOCUMENTS + '/requests/' + id + '/approve', {});
    }

    rejectRequest(id: number, reason: string): Observable<DocumentRequest> {
        return this.http.post<DocumentRequest>(BASE_URL + HR_DOCUMENTS + '/requests/' + id + '/reject', { reason });
    }
}
