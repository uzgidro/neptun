import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PersonnelRecord, PersonnelRecordPayload } from '@/core/interfaces/hrm/personnel-record';

// Мок-данные личных дел (12 сотрудников)
const MOCK_PERSONNEL_RECORDS: PersonnelRecord[] = [
    {
        id: 1,
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        tab_number: 'ТН-001',
        hire_date: '2015-03-15',
        department_id: 1,
        department_name: 'Руководство',
        position_id: 1,
        position_name: 'Генеральный директор',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2015-03-15T09:00:00Z',
        updated_at: '2025-01-10T14:00:00Z'
    },
    {
        id: 2,
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        tab_number: 'ТН-002',
        hire_date: '2017-06-01',
        department_id: 7,
        department_name: 'Отдел кадров',
        position_id: 2,
        position_name: 'Начальник отдела кадров',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2017-06-01T09:00:00Z',
        updated_at: '2025-03-20T11:00:00Z'
    },
    {
        id: 3,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        tab_number: 'ТН-003',
        hire_date: '2016-09-12',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 3,
        position_name: 'Начальник производства',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2016-09-12T09:00:00Z',
        updated_at: '2025-04-15T10:00:00Z'
    },
    {
        id: 4,
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        tab_number: 'ТН-004',
        hire_date: '2018-01-20',
        department_id: 5,
        department_name: 'Финансовый отдел',
        position_id: 4,
        position_name: 'Главный бухгалтер',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2018-01-20T09:00:00Z',
        updated_at: '2025-06-01T09:00:00Z'
    },
    {
        id: 5,
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        tab_number: 'ТН-005',
        hire_date: '2019-04-15',
        department_id: 6,
        department_name: 'IT-отдел',
        position_id: 5,
        position_name: 'Системный администратор',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2019-04-15T09:00:00Z',
        updated_at: '2025-07-10T13:00:00Z'
    },
    {
        id: 6,
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        tab_number: 'ТН-006',
        hire_date: '2020-02-10',
        department_id: 8,
        department_name: 'Юридический отдел',
        position_id: 6,
        position_name: 'Юрист',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2020-02-10T09:00:00Z',
        updated_at: '2025-08-20T10:00:00Z'
    },
    {
        id: 7,
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        tab_number: 'ТН-007',
        hire_date: '2019-11-25',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 7,
        position_name: 'Технолог',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2019-11-25T09:00:00Z',
        updated_at: '2025-09-05T14:00:00Z'
    },
    {
        id: 8,
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        tab_number: 'ТН-008',
        hire_date: '2021-03-01',
        department_id: 3,
        department_name: 'Отдел контроля качества',
        position_id: 8,
        position_name: 'Инженер по качеству',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2021-03-01T09:00:00Z',
        updated_at: '2025-10-12T11:00:00Z'
    },
    {
        id: 9,
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        tab_number: 'ТН-009',
        hire_date: '2020-07-14',
        department_id: 4,
        department_name: 'Отдел логистики',
        position_id: 9,
        position_name: 'Менеджер по логистике',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2020-07-14T09:00:00Z',
        updated_at: '2025-11-18T15:00:00Z'
    },
    {
        id: 10,
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        tab_number: 'ТН-010',
        hire_date: '2022-01-10',
        department_id: 7,
        department_name: 'Отдел кадров',
        position_id: 10,
        position_name: 'Специалист по кадрам',
        contract_type: 'permanent',
        status: 'active',
        created_at: '2022-01-10T09:00:00Z',
        updated_at: '2025-12-01T09:00:00Z'
    },
    {
        id: 11,
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        tab_number: 'ТН-011',
        hire_date: '2023-05-20',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 11,
        position_name: 'Оператор',
        contract_type: 'temporary',
        contract_end_date: '2026-05-20',
        status: 'on_leave',
        created_at: '2023-05-20T09:00:00Z',
        updated_at: '2026-02-01T10:00:00Z'
    },
    {
        id: 12,
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        tab_number: 'ТН-012',
        hire_date: '2023-09-01',
        department_id: 5,
        department_name: 'Финансовый отдел',
        position_id: 12,
        position_name: 'Бухгалтер',
        contract_type: 'contract',
        contract_end_date: '2025-09-01',
        status: 'active',
        created_at: '2023-09-01T09:00:00Z',
        updated_at: '2026-01-15T12:00:00Z'
    }
];

@Injectable({
    providedIn: 'root'
})
export class PersonnelRecordService extends ApiService {
    getPersonnelRecords(): Observable<PersonnelRecord[]> {
        return of(MOCK_PERSONNEL_RECORDS).pipe(delay(300));
    }

    getPersonnelRecord(id: number): Observable<PersonnelRecord> {
        const record = MOCK_PERSONNEL_RECORDS.find((r) => r.id === id);
        return of(record as PersonnelRecord).pipe(delay(300));
    }

    createPersonnelRecord(payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        const newRecord: PersonnelRecord = {
            id: Date.now(),
            employee_id: payload.employee_id || 0,
            employee_name: '',
            tab_number: payload.tab_number || '',
            hire_date: payload.hire_date || '',
            department_id: payload.department_id || 0,
            position_id: payload.position_id || 0,
            contract_type: (payload.contract_type as PersonnelRecord['contract_type']) || 'permanent',
            contract_end_date: payload.contract_end_date,
            status: (payload.status as PersonnelRecord['status']) || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return of(newRecord).pipe(delay(200));
    }

    updatePersonnelRecord(id: number, payload: PersonnelRecordPayload): Observable<PersonnelRecord> {
        const existing = MOCK_PERSONNEL_RECORDS.find((r) => r.id === id);
        const updated: PersonnelRecord = {
            ...(existing || { id, employee_id: 0, employee_name: '', tab_number: '', hire_date: '', department_id: 0, position_id: 0, contract_type: 'permanent' as const, status: 'active' as const }),
            ...payload,
            contract_type: (payload.contract_type as PersonnelRecord['contract_type']) || existing?.contract_type || 'permanent',
            status: (payload.status as PersonnelRecord['status']) || existing?.status || 'active',
            updated_at: new Date().toISOString()
        };
        return of(updated).pipe(delay(200));
    }

    deletePersonnelRecord(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
