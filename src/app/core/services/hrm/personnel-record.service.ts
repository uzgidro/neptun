import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@/core/services/config.service';
import { PersonnelRecord, PersonnelRecordPayload, PersonnelDocument, PersonnelTransfer } from '@/core/interfaces/hrm/personnel-record';

@Injectable({
    providedIn: 'root'
})
export class PersonnelRecordService {
    private http = inject(HttpClient);
    private configService = inject(ConfigService);

    private get API_URL(): string {
        return this.configService.apiBaseUrl + '/hrm/personnel-records';
    }

    getAll(): Observable<PersonnelRecord[]> {
        return this.http.get<PersonnelRecord[]>(this.API_URL);
    }

    getById(id: number): Observable<PersonnelRecord> {
        return this.http.get<PersonnelRecord>(`${this.API_URL}/${id}`);
    }

    getByEmployeeId(employeeId: number): Observable<PersonnelRecord> {
        return this.http.get<PersonnelRecord>(`${this.API_URL}/employee/${employeeId}`);
    }

    create(payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        return this.http.post<PersonnelRecord>(this.API_URL, payload);
    }

    update(id: number, payload: Partial<PersonnelRecordPayload>): Observable<PersonnelRecord> {
        return this.http.patch<PersonnelRecord>(`${this.API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }

    getDocuments(recordId: number): Observable<PersonnelDocument[]> {
        return this.http.get<PersonnelDocument[]>(`${this.API_URL}/${recordId}/documents`);
    }

    deleteDocument(recordId: number, documentId: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${recordId}/documents/${documentId}`);
    }

    getTransfers(recordId: number): Observable<PersonnelTransfer[]> {
        return this.http.get<PersonnelTransfer[]>(`${this.API_URL}/${recordId}/transfers`);
    }

    createTransfer(recordId: number, transfer: Partial<PersonnelTransfer>): Observable<PersonnelTransfer> {
        return this.http.post<PersonnelTransfer>(`${this.API_URL}/${recordId}/transfers`, transfer);
    }
}
