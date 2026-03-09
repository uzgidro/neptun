import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { PersonnelRecord, PersonnelRecordPayload } from '@/core/interfaces/hrm/personnel-record';

const PERSONNEL_RECORDS = '/hrm/personnel-records';
const USE_MOCK = !BASE_URL;

const MOCK_PERSONNEL_RECORDS: PersonnelRecord[] = [
    {
        id: 1, employee_id: 101, employee_name: 'Каримов Бахтиёр Рустамович', tab_number: 'ТН-001247', hire_date: '2015-03-12',
        department_id: 1, department_name: 'Молокозавод «Чирчик»', position_id: 1, position_name: 'Начальник смены',
        contract_type: 'permanent', status: 'active',
        documents: [
            { id: 1, personnel_record_id: 1, document_type: 'Трудовой договор', document_number: 'ТД-1247', issue_date: '2015-03-12', file_url: '/docs/contract_1247.pdf' },
            { id: 2, personnel_record_id: 1, document_type: 'Приказ о приёме', document_number: 'ПР-2015/045', issue_date: '2015-03-12', file_url: '/docs/order_1247.pdf' },
            { id: 3, personnel_record_id: 1, document_type: 'Диплом', document_number: 'ДВ-098765', issue_date: '2013-06-20', file_url: '/docs/diploma_1247.pdf' }
        ],
        transfers: [
            { id: 1, personnel_record_id: 1, from_department_id: 5, from_department_name: 'Молокозавод «Ахангаран»', to_department_id: 1, to_department_name: 'Молокозавод «Чирчик»', from_position_id: 6, from_position_name: 'Инженер-технолог', to_position_id: 1, to_position_name: 'Начальник смены', transfer_date: '2020-06-01', order_number: 'ПР-2020/187', reason: 'Повышение в должности' }
        ],
        created_at: '2015-03-12T09:00:00Z', updated_at: '2024-11-15T14:30:00Z'
    },
    {
        id: 2, employee_id: 102, employee_name: 'Султанова Дилноза Анваровна', tab_number: 'ТН-002184', hire_date: '2018-09-01',
        department_id: 9, department_name: 'Центральный аппарат', position_id: 8, position_name: 'Экономист',
        contract_type: 'permanent', status: 'active',
        documents: [
            { id: 4, personnel_record_id: 2, document_type: 'Трудовой договор', document_number: 'ТД-2184', issue_date: '2018-09-01', file_url: '/docs/contract_2184.pdf' },
            { id: 5, personnel_record_id: 2, document_type: 'Приказ о приёме', document_number: 'ПР-2018/312', issue_date: '2018-09-01', file_url: '/docs/order_2184.pdf' }
        ],
        transfers: [],
        created_at: '2018-09-01T09:00:00Z', updated_at: '2025-01-20T10:15:00Z'
    },
    {
        id: 3, employee_id: 103, employee_name: 'Рахимов Шерзод Тулкинович', tab_number: 'ТН-000892', hire_date: '2012-05-15',
        department_id: 3, department_name: 'Молокозавод «Фергана»', position_id: 2, position_name: 'Оператор технологического оборудования',
        contract_type: 'permanent', status: 'on_leave',
        documents: [
            { id: 6, personnel_record_id: 3, document_type: 'Трудовой договор', document_number: 'ТД-0892', issue_date: '2012-05-15', file_url: '/docs/contract_892.pdf' },
            { id: 7, personnel_record_id: 3, document_type: 'Приказ о приёме', document_number: 'ПР-2012/156', issue_date: '2012-05-15', file_url: '/docs/order_892.pdf' },
            { id: 8, personnel_record_id: 3, document_type: 'Приказ на отпуск', document_number: 'ПР-2026/048', issue_date: '2026-02-20', file_url: '/docs/leave_892.pdf' }
        ],
        transfers: [
            { id: 2, personnel_record_id: 3, from_department_id: 3, from_department_name: 'Молокозавод «Фергана»', to_department_id: 3, to_department_name: 'Молокозавод «Фергана»', from_position_id: 3, from_position_name: 'Наладчик оборудования', to_position_id: 2, to_position_name: 'Оператор технологического оборудования', transfer_date: '2017-01-10', order_number: 'ПР-2017/012', reason: 'Повышение квалификации' }
        ],
        created_at: '2012-05-15T09:00:00Z', updated_at: '2026-02-20T11:45:00Z'
    },
    {
        id: 4, employee_id: 104, employee_name: 'Абдуллаев Жасур Камолович', tab_number: 'ТН-003451', hire_date: '2023-01-10',
        department_id: 7, department_name: 'Чирчик-Бозсуйский молочный комбинат', position_id: 3, position_name: 'Наладчик оборудования',
        contract_type: 'temporary', contract_end_date: '2027-01-10', status: 'active',
        documents: [
            { id: 9, personnel_record_id: 4, document_type: 'Трудовой договор (срочный)', document_number: 'ТД-3451', issue_date: '2023-01-10', expiry_date: '2027-01-10', file_url: '/docs/contract_3451.pdf' },
            { id: 10, personnel_record_id: 4, document_type: 'Приказ о приёме', document_number: 'ПР-2023/008', issue_date: '2023-01-10', file_url: '/docs/order_3451.pdf' }
        ],
        transfers: [],
        created_at: '2023-01-10T09:00:00Z', updated_at: '2025-08-05T16:20:00Z'
    },
    {
        id: 5, employee_id: 105, employee_name: 'Мирзаева Нигора Хамидовна', tab_number: 'ТН-001978', hire_date: '2016-11-20',
        department_id: 2, department_name: 'Молокозавод «Джизак»', position_id: 4, position_name: 'Диспетчер',
        contract_type: 'permanent', status: 'active',
        documents: [
            { id: 11, personnel_record_id: 5, document_type: 'Трудовой договор', document_number: 'ТД-1978', issue_date: '2016-11-20', file_url: '/docs/contract_1978.pdf' },
            { id: 12, personnel_record_id: 5, document_type: 'Приказ о приёме', document_number: 'ПР-2016/389', issue_date: '2016-11-20', file_url: '/docs/order_1978.pdf' },
            { id: 13, personnel_record_id: 5, document_type: 'Удостоверение о повышении квалификации', document_number: 'УПК-2024/112', issue_date: '2024-04-10', file_url: '/docs/cert_1978.pdf' }
        ],
        transfers: [
            { id: 3, personnel_record_id: 5, from_department_id: 1, from_department_name: 'Молокозавод «Чирчик»', to_department_id: 2, to_department_name: 'Молокозавод «Джизак»', from_position_id: 4, from_position_name: 'Диспетчер', to_position_id: 4, to_position_name: 'Диспетчер', transfer_date: '2021-03-15', order_number: 'ПР-2021/078', reason: 'Перевод по производственной необходимости' }
        ],
        created_at: '2016-11-20T09:00:00Z', updated_at: '2025-06-12T13:00:00Z'
    }
];

@Injectable({
    providedIn: 'root'
})
export class PersonnelRecordService extends ApiService {
    getPersonnelRecords(): Observable<PersonnelRecord[]> {
        if (USE_MOCK) return of(MOCK_PERSONNEL_RECORDS).pipe(delay(200));
        return this.http.get<PersonnelRecord[]>(BASE_URL + PERSONNEL_RECORDS);
    }

    getPersonnelRecord(id: number): Observable<PersonnelRecord> {
        if (USE_MOCK) return of(MOCK_PERSONNEL_RECORDS.find((r) => r.id === id) || MOCK_PERSONNEL_RECORDS[0]).pipe(delay(200));
        return this.http.get<PersonnelRecord>(BASE_URL + PERSONNEL_RECORDS + '/' + id);
    }

    createPersonnelRecord(payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        if (USE_MOCK) return of({ id: 6, ...payload, employee_name: 'Новый сотрудник', tab_number: 'ТН-004000', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PersonnelRecord).pipe(delay(200));
        return this.http.post<PersonnelRecord>(BASE_URL + PERSONNEL_RECORDS, payload);
    }

    updatePersonnelRecord(id: number, payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        if (USE_MOCK) {
            const existing = MOCK_PERSONNEL_RECORDS.find((r) => r.id === id) || MOCK_PERSONNEL_RECORDS[0];
            return of({ ...existing, ...payload, updated_at: new Date().toISOString() } as PersonnelRecord).pipe(delay(200));
        }
        return this.http.patch<PersonnelRecord>(BASE_URL + PERSONNEL_RECORDS + '/' + id, payload);
    }

    deletePersonnelRecord(id: number): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.delete(BASE_URL + PERSONNEL_RECORDS + '/' + id);
    }
}
