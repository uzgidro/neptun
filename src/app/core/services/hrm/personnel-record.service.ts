import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { PersonnelRecord, PersonnelRecordPayload, PersonnelDocument, PersonnelTransfer } from '@/core/interfaces/hrm/personnel-record';

const API_URL = BASE_URL + '/hrm/personnel-records';

@Injectable({
    providedIn: 'root'
})
export class PersonnelRecordService {
    private http = inject(HttpClient);

    getAll(): Observable<PersonnelRecord[]> {
        return this.http.get<PersonnelRecord[]>(API_URL);
    }

    getById(id: number): Observable<PersonnelRecord> {
        return this.http.get<PersonnelRecord>(`${API_URL}/${id}`);
    }

    getByEmployeeId(employeeId: number): Observable<PersonnelRecord> {
        return this.http.get<PersonnelRecord>(`${API_URL}/employee/${employeeId}`);
    }

    create(payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        return this.http.post<PersonnelRecord>(API_URL, payload);
    }

    update(id: number, payload: Partial<PersonnelRecordPayload>): Observable<PersonnelRecord> {
        return this.http.put<PersonnelRecord>(`${API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    getDocuments(recordId: number): Observable<PersonnelDocument[]> {
        return this.http.get<PersonnelDocument[]>(`${API_URL}/${recordId}/documents`);
    }

    uploadDocument(recordId: number, formData: FormData): Observable<PersonnelDocument> {
        return this.http.post<PersonnelDocument>(`${API_URL}/${recordId}/documents`, formData);
    }

    deleteDocument(recordId: number, documentId: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${recordId}/documents/${documentId}`);
    }

    getTransfers(recordId: number): Observable<PersonnelTransfer[]> {
        return this.http.get<PersonnelTransfer[]>(`${API_URL}/${recordId}/transfers`);
    }

    createTransfer(recordId: number, transfer: Partial<PersonnelTransfer>): Observable<PersonnelTransfer> {
        return this.http.post<PersonnelTransfer>(`${API_URL}/${recordId}/transfers`, transfer);
    }
}
