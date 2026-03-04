import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Vacation, VacationPayload, VacationBalance, VacationType, VacationStatus } from '@/core/interfaces/hrm/vacation';

const VACATIONS = '/hrm/vacations';
const USE_MOCK = !BASE_URL;

const MOCK_VACATIONS: Vacation[] = [
    {
        id: 1,
        employee_id: 101,
        employee_name: 'Каримов Азиз Бахтиёрович',
        department_id: 1,
        department_name: 'Департамент эксплуатации',
        vacation_type: 'annual' as VacationType,
        start_date: '2026-04-01',
        end_date: '2026-04-14',
        days_count: 14,
        status: 'approved' as VacationStatus,
        approver_id: 201,
        approver_name: 'Рахимов Шерзод Алишерович',
        approved_at: '2026-03-15T10:30:00Z',
        reason: 'Ежегодный основной отпуск',
        created_at: '2026-03-01T09:00:00Z',
        updated_at: '2026-03-15T10:30:00Z'
    },
    {
        id: 2,
        employee_id: 102,
        employee_name: 'Юсупова Малика Рустамовна',
        department_id: 2,
        department_name: 'Финансовый отдел',
        vacation_type: 'sick' as VacationType,
        start_date: '2026-03-10',
        end_date: '2026-03-17',
        days_count: 7,
        status: 'approved' as VacationStatus,
        approver_id: 202,
        approver_name: 'Хасанов Ильхом Маратович',
        approved_at: '2026-03-10T08:15:00Z',
        reason: 'Больничный лист',
        created_at: '2026-03-10T08:00:00Z',
        updated_at: '2026-03-10T08:15:00Z'
    },
    {
        id: 3,
        employee_id: 103,
        employee_name: 'Норматов Дильшод Камолович',
        department_id: 3,
        department_name: 'Юридический отдел',
        vacation_type: 'annual' as VacationType,
        start_date: '2026-05-01',
        end_date: '2026-05-21',
        days_count: 21,
        status: 'pending' as VacationStatus,
        reason: 'Ежегодный основной отпуск',
        created_at: '2026-03-02T14:00:00Z',
        updated_at: '2026-03-02T14:00:00Z'
    },
    {
        id: 4,
        employee_id: 104,
        employee_name: 'Абдуллаева Нигора Файзуллоевна',
        department_id: 1,
        department_name: 'Департамент эксплуатации',
        vacation_type: 'maternity' as VacationType,
        start_date: '2026-06-01',
        end_date: '2026-09-30',
        days_count: 122,
        status: 'draft' as VacationStatus,
        reason: 'Декретный отпуск',
        created_at: '2026-03-03T11:00:00Z',
        updated_at: '2026-03-03T11:00:00Z'
    },
    {
        id: 5,
        employee_id: 105,
        employee_name: 'Тошматов Бобур Эркинович',
        department_id: 4,
        department_name: 'Отдел кадров',
        vacation_type: 'study' as VacationType,
        start_date: '2026-04-15',
        end_date: '2026-04-25',
        days_count: 10,
        status: 'rejected' as VacationStatus,
        approver_id: 203,
        approver_name: 'Мирзаев Отабек Бахромович',
        rejection_reason: 'Превышен лимит одновременных отпусков в отделе',
        reason: 'Учебная сессия',
        created_at: '2026-02-20T09:30:00Z',
        updated_at: '2026-02-25T16:00:00Z'
    },
    {
        id: 6,
        employee_id: 106,
        employee_name: 'Салимов Жасур Улугбекович',
        department_id: 5,
        department_name: 'Технический отдел',
        vacation_type: 'unpaid' as VacationType,
        start_date: '2026-03-20',
        end_date: '2026-03-25',
        days_count: 5,
        status: 'cancelled' as VacationStatus,
        reason: 'По семейным обстоятельствам',
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-05T12:00:00Z'
    },
    {
        id: 7,
        employee_id: 107,
        employee_name: 'Холматова Дилноза Абдумаликовна',
        department_id: 2,
        department_name: 'Финансовый отдел',
        vacation_type: 'annual' as VacationType,
        start_date: '2026-07-01',
        end_date: '2026-07-14',
        days_count: 14,
        status: 'pending' as VacationStatus,
        reason: 'Ежегодный основной отпуск',
        created_at: '2026-03-04T08:00:00Z',
        updated_at: '2026-03-04T08:00:00Z'
    },
    {
        id: 8,
        employee_id: 108,
        employee_name: 'Исмоилов Фаррух Хамидович',
        department_id: 3,
        department_name: 'Юридический отдел',
        vacation_type: 'other' as VacationType,
        start_date: '2026-03-28',
        end_date: '2026-03-30',
        days_count: 3,
        status: 'approved' as VacationStatus,
        approver_id: 201,
        approver_name: 'Рахимов Шерзод Алишерович',
        approved_at: '2026-03-20T14:00:00Z',
        reason: 'Участие в конференции',
        created_at: '2026-03-15T09:00:00Z',
        updated_at: '2026-03-20T14:00:00Z'
    }
];

const MOCK_VACATION_BALANCES: VacationBalance[] = [
    { id: 1, employee_id: 101, employee_name: 'Каримов Азиз Бахтиёрович', year: 2026, total_days: 28, used_days: 14, pending_days: 0, remaining_days: 14, carried_over_days: 3 },
    { id: 2, employee_id: 102, employee_name: 'Юсупова Малика Рустамовна', year: 2026, total_days: 24, used_days: 7, pending_days: 0, remaining_days: 17, carried_over_days: 0 },
    { id: 3, employee_id: 103, employee_name: 'Норматов Дильшод Камолович', year: 2026, total_days: 28, used_days: 0, pending_days: 21, remaining_days: 7, carried_over_days: 5 },
    { id: 4, employee_id: 105, employee_name: 'Тошматов Бобур Эркинович', year: 2026, total_days: 24, used_days: 10, pending_days: 0, remaining_days: 14, carried_over_days: 2 },
    { id: 5, employee_id: 107, employee_name: 'Холматова Дилноза Абдумаликовна', year: 2026, total_days: 24, used_days: 0, pending_days: 14, remaining_days: 10, carried_over_days: 0 }
];

@Injectable({
    providedIn: 'root'
})
export class VacationService extends ApiService {
    // Vacations CRUD
    getVacations(): Observable<Vacation[]> {
        if (USE_MOCK) return of(MOCK_VACATIONS).pipe(delay(200));
        return this.http.get<Vacation[]>(BASE_URL + VACATIONS);
    }

    getVacation(id: number): Observable<Vacation> {
        if (USE_MOCK) return of(MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0]).pipe(delay(200));
        return this.http.get<Vacation>(BASE_URL + VACATIONS + '/' + id);
    }

    createVacation(payload: VacationPayload): Observable<Vacation> {
        if (USE_MOCK) {
            const newVacation: Vacation = {
                id: MOCK_VACATIONS.length + 1,
                employee_id: payload.employee_id || 101,
                employee_name: 'Новый Сотрудник',
                vacation_type: (payload.vacation_type as VacationType) || 'annual',
                start_date: payload.start_date || '2026-04-01',
                end_date: payload.end_date || '2026-04-14',
                days_count: 14,
                status: 'draft',
                reason: payload.reason,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return of(newVacation).pipe(delay(200));
        }
        return this.http.post<Vacation>(BASE_URL + VACATIONS, payload);
    }

    updateVacation(id: number, payload: VacationPayload): Observable<Vacation> {
        if (USE_MOCK) {
            const existing = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({ ...existing, ...payload, updated_at: new Date().toISOString() } as Vacation).pipe(delay(200));
        }
        return this.http.patch<Vacation>(BASE_URL + VACATIONS + '/' + id, payload);
    }

    deleteVacation(id: number): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.delete(BASE_URL + VACATIONS + '/' + id);
    }

    // Vacation status actions
    approveVacation(id: number): Observable<Vacation> {
        if (USE_MOCK) {
            const vacation = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({ ...vacation, status: 'approved' as VacationStatus, approver_id: 201, approver_name: 'Рахимов Шерзод Алишерович', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<Vacation>(BASE_URL + VACATIONS + '/' + id + '/approve', {});
    }

    rejectVacation(id: number, rejectionReason: string): Observable<Vacation> {
        if (USE_MOCK) {
            const vacation = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({ ...vacation, status: 'rejected' as VacationStatus, rejection_reason: rejectionReason, updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<Vacation>(BASE_URL + VACATIONS + '/' + id + '/reject', { rejection_reason: rejectionReason });
    }

    cancelVacation(id: number): Observable<Vacation> {
        if (USE_MOCK) {
            const vacation = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({ ...vacation, status: 'cancelled' as VacationStatus, updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<Vacation>(BASE_URL + VACATIONS + '/' + id + '/cancel', {});
    }

    // Vacation balances
    getVacationBalances(): Observable<VacationBalance[]> {
        if (USE_MOCK) return of(MOCK_VACATION_BALANCES).pipe(delay(200));
        return this.http.get<VacationBalance[]>(BASE_URL + VACATIONS + '/balances');
    }

    getVacationBalance(employeeId: number): Observable<VacationBalance> {
        if (USE_MOCK) return of(MOCK_VACATION_BALANCES.find((b) => b.employee_id === employeeId) || MOCK_VACATION_BALANCES[0]).pipe(delay(200));
        return this.http.get<VacationBalance>(BASE_URL + VACATIONS + '/balance/' + employeeId);
    }
}
