import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { PersonnelRecord, PersonnelRecordPayload } from '@/core/interfaces/hrm/personnel-record';

const PERSONNEL_RECORDS = '/personnel-records';

@Injectable({
    providedIn: 'root'
})
export class PersonnelRecordService extends ApiService {
    getPersonnelRecords(): Observable<PersonnelRecord[]> {
        return this.http.get<PersonnelRecord[]>(BASE_URL + PERSONNEL_RECORDS);
    }

    getPersonnelRecord(id: number): Observable<PersonnelRecord> {
        return this.http.get<PersonnelRecord>(BASE_URL + PERSONNEL_RECORDS + '/' + id);
    }

    createPersonnelRecord(payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        return this.http.post<PersonnelRecord>(BASE_URL + PERSONNEL_RECORDS, payload);
    }

    updatePersonnelRecord(id: number, payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        return this.http.patch<PersonnelRecord>(BASE_URL + PERSONNEL_RECORDS + '/' + id, payload);
    }

    deletePersonnelRecord(id: number): Observable<any> {
        return this.http.delete(BASE_URL + PERSONNEL_RECORDS + '/' + id);
    }
}
