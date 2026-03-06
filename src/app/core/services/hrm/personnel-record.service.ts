import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { PersonnelRecord, PersonnelRecordPayload, PersonnelDocument, PersonnelTransfer } from '@/core/interfaces/hrm/personnel-record';

const API_URL = BASE_URL + '/hrm/personnel-records';
const USE_MOCK = !BASE_URL;

const MOCK_RECORDS: PersonnelRecord[] = [
    {
        id: 1,
        employee_id: 101,
        employee_name: 'Каримов Алишер Бахтиёрович',
        tab_number: 'UGE-001524',
        hire_date: '2015-06-15',
        department_id: 10,
        department_name: 'Служба эксплуатации Молокозавода «Чарвак»',
        position_id: 201,
        position_name: 'Главный инженер',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2015-06-15T09:00:00Z',
        updated_at: '2025-12-01T14:30:00Z'
    },
    {
        id: 2,
        employee_id: 102,
        employee_name: 'Мирзаева Дильшод Рустамович',
        tab_number: 'UGE-002318',
        hire_date: '2018-09-01',
        department_id: 20,
        department_name: 'Молокозавод «Туямуюн»',
        position_id: 205,
        position_name: 'Инженер-технолог',
        contract_type: 'permanent',
        status: 'on_leave',
        created_at: '2018-09-01T09:00:00Z',
        updated_at: '2026-02-28T10:15:00Z'
    },
    {
        id: 3,
        employee_id: 103,
        employee_name: 'Юлдашева Нигора Абдуллаевна',
        tab_number: 'UGE-000847',
        hire_date: '2010-03-20',
        department_id: 30,
        department_name: 'Бухгалтерия',
        position_id: 301,
        position_name: 'Главный бухгалтер',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2010-03-20T09:00:00Z',
        updated_at: '2026-01-15T11:00:00Z'
    },
    {
        id: 4,
        employee_id: 104,
        employee_name: 'Рахматуллаев Сардор Ильхомович',
        tab_number: 'UGE-004721',
        hire_date: '2025-12-03',
        department_id: 15,
        department_name: 'Молокозавод «Ходжикент»',
        position_id: 210,
        position_name: 'Инженер-технолог',
        contract_type: 'temporary',
        contract_end_date: '2026-06-03',
        status: 'active',
        created_at: '2025-12-03T09:00:00Z',
        updated_at: '2025-12-03T09:00:00Z'
    },
    {
        id: 5,
        employee_id: 105,
        employee_name: 'Хасанов Бахтиёр Насруллаевич',
        tab_number: 'UGE-001103',
        hire_date: '2012-08-10',
        department_id: 10,
        department_name: 'Техническое управление',
        position_id: 202,
        position_name: 'Старший инженер-технолог',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2012-08-10T09:00:00Z',
        updated_at: '2026-02-10T16:45:00Z'
    }
];

const MOCK_DOCUMENTS: PersonnelDocument[] = [
    {
        id: 1,
        personnel_record_id: 1,
        document_type: 'passport',
        document_number: 'AA 1234567',
        issue_date: '2020-05-12',
        expiry_date: '2030-05-12',
        file_url: '/files/documents/passport_karimov.pdf',
        created_at: '2015-06-15T09:30:00Z'
    },
    {
        id: 2,
        personnel_record_id: 1,
        document_type: 'diploma',
        document_number: 'DT-2010-456789',
        issue_date: '2010-06-25',
        file_url: '/files/documents/diploma_karimov.pdf',
        created_at: '2015-06-15T09:35:00Z'
    },
    {
        id: 3,
        personnel_record_id: 1,
        document_type: 'employment_contract',
        document_number: 'ТД-001524',
        issue_date: '2015-06-15',
        file_url: '/files/documents/contract_karimov.pdf',
        created_at: '2015-06-15T10:00:00Z'
    }
];

const MOCK_TRANSFERS: PersonnelTransfer[] = [
    {
        id: 1,
        personnel_record_id: 1,
        from_department_id: 20,
        from_department_name: 'Молокозавод «Туямуюн»',
        to_department_id: 10,
        to_department_name: 'Служба эксплуатации Молокозавода «Чарвак»',
        from_position_id: 205,
        from_position_name: 'Инженер-технолог',
        to_position_id: 201,
        to_position_name: 'Главный инженер',
        transfer_date: '2020-04-01',
        order_number: 'ПР-2020/087',
        reason: 'Повышение в должности по результатам аттестации',
        created_at: '2020-03-25T14:00:00Z'
    },
    {
        id: 2,
        personnel_record_id: 5,
        from_department_id: 15,
        from_department_name: 'Молокозавод «Ходжикент»',
        to_department_id: 10,
        to_department_name: 'Техническое управление',
        from_position_id: 205,
        from_position_name: 'Инженер-технолог',
        to_position_id: 202,
        to_position_name: 'Старший инженер-технолог',
        transfer_date: '2019-01-15',
        order_number: 'ПР-2019/012',
        reason: 'Перевод в головной офис с повышением',
        created_at: '2019-01-10T10:00:00Z'
    }
];

@Injectable({
    providedIn: 'root'
})
export class PersonnelRecordService {
    private http = inject(HttpClient);

    getAll(): Observable<PersonnelRecord[]> {
        if (USE_MOCK) return of(MOCK_RECORDS).pipe(delay(200));
        return this.http.get<PersonnelRecord[]>(API_URL);
    }

    getById(id: number): Observable<PersonnelRecord> {
        if (USE_MOCK) return of(MOCK_RECORDS.find((r) => r.id === id) || MOCK_RECORDS[0]).pipe(delay(200));
        return this.http.get<PersonnelRecord>(`${API_URL}/${id}`);
    }

    getByEmployeeId(employeeId: number): Observable<PersonnelRecord> {
        if (USE_MOCK) return of(MOCK_RECORDS.find((r) => r.employee_id === employeeId) || MOCK_RECORDS[0]).pipe(delay(200));
        return this.http.get<PersonnelRecord>(`${API_URL}/employee/${employeeId}`);
    }

    create(payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        if (USE_MOCK)
            return of({
                id: 6,
                employee_id: payload.employee_id || 106,
                employee_name: 'Новый Сотрудник',
                tab_number: payload.tab_number || 'UGE-005001',
                hire_date: payload.hire_date || '2026-03-04',
                department_id: payload.department_id || 10,
                department_name: 'Техническое управление',
                position_id: payload.position_id || 205,
                position_name: 'Инженер-технолог',
                contract_type: (payload.contract_type as 'permanent' | 'temporary' | 'contract') || 'permanent',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).pipe(delay(200));
        return this.http.post<PersonnelRecord>(API_URL, payload);
    }

    update(id: number, payload: Partial<PersonnelRecordPayload>): Observable<PersonnelRecord> {
        if (USE_MOCK) {
            const existing = MOCK_RECORDS.find((r) => r.id === id) || MOCK_RECORDS[0];
            return of({ ...existing, ...payload, updated_at: new Date().toISOString() } as PersonnelRecord).pipe(delay(200));
        }
        return this.http.patch<PersonnelRecord>(`${API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    getDocuments(recordId: number): Observable<PersonnelDocument[]> {
        if (USE_MOCK) return of(MOCK_DOCUMENTS.filter((d) => d.personnel_record_id === recordId)).pipe(delay(200));
        return this.http.get<PersonnelDocument[]>(`${API_URL}/${recordId}/documents`);
    }

    uploadDocument(recordId: number, formData: FormData): Observable<PersonnelDocument> {
        if (USE_MOCK)
            return of({
                id: 10,
                personnel_record_id: recordId,
                document_type: 'other',
                document_number: 'DOC-' + Date.now(),
                issue_date: '2026-03-04',
                file_url: '/files/documents/uploaded_document.pdf',
                created_at: new Date().toISOString()
            }).pipe(delay(200));
        return this.http.post<PersonnelDocument>(`${API_URL}/${recordId}/documents`, formData);
    }

    deleteDocument(recordId: number, documentId: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/${recordId}/documents/${documentId}`);
    }

    getTransfers(recordId: number): Observable<PersonnelTransfer[]> {
        if (USE_MOCK) return of(MOCK_TRANSFERS.filter((t) => t.personnel_record_id === recordId)).pipe(delay(200));
        return this.http.get<PersonnelTransfer[]>(`${API_URL}/${recordId}/transfers`);
    }

    createTransfer(recordId: number, transfer: Partial<PersonnelTransfer>): Observable<PersonnelTransfer> {
        if (USE_MOCK)
            return of({
                id: 3,
                personnel_record_id: recordId,
                from_department_id: transfer.from_department_id || 10,
                from_department_name: transfer.from_department_name || 'Техническое управление',
                to_department_id: transfer.to_department_id || 20,
                to_department_name: transfer.to_department_name || 'Молокозавод «Туямуюн»',
                from_position_id: transfer.from_position_id || 202,
                from_position_name: transfer.from_position_name || 'Старший инженер-технолог',
                to_position_id: transfer.to_position_id || 201,
                to_position_name: transfer.to_position_name || 'Главный инженер',
                transfer_date: transfer.transfer_date || '2026-03-04',
                order_number: transfer.order_number || 'ПР-2026/015',
                reason: transfer.reason || 'Перевод',
                created_at: new Date().toISOString()
            }).pipe(delay(200));
        return this.http.post<PersonnelTransfer>(`${API_URL}/${recordId}/transfers`, transfer);
    }
}
