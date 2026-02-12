import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Vacation, VacationPayload, VacationBalance } from '@/core/interfaces/hrm/vacation';

// Мок-данные заявок на отпуск (10 заявок)
const MOCK_VACATIONS: Vacation[] = [
    {
        id: 1,
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        department_id: 2,
        department_name: 'Производственный отдел',
        vacation_type: 'annual',
        start_date: '2026-03-01',
        end_date: '2026-03-14',
        days_count: 14,
        status: 'approved',
        approver_id: 3,
        approver_name: 'Юлдашев Ботир Камолович',
        approved_at: '2026-02-09T11:45:00Z',
        reason: 'Семейный отдых',
        created_at: '2026-02-01T09:00:00Z',
        updated_at: '2026-02-09T11:45:00Z'
    },
    {
        id: 2,
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        department_id: 7,
        department_name: 'Отдел кадров',
        vacation_type: 'annual',
        start_date: '2026-06-01',
        end_date: '2026-06-14',
        days_count: 14,
        status: 'pending',
        reason: 'Летний отпуск',
        created_at: '2026-02-10T10:00:00Z',
        updated_at: '2026-02-10T10:00:00Z'
    },
    {
        id: 3,
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        department_id: 4,
        department_name: 'Отдел логистики',
        vacation_type: 'annual',
        start_date: '2025-12-15',
        end_date: '2025-12-28',
        days_count: 14,
        status: 'cancelled',
        reason: 'Новогодний отпуск',
        created_at: '2025-11-20T08:00:00Z',
        updated_at: '2025-12-01T09:00:00Z'
    },
    {
        id: 4,
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        department_id: 3,
        department_name: 'Отдел контроля качества',
        vacation_type: 'sick',
        start_date: '2026-01-20',
        end_date: '2026-01-24',
        days_count: 5,
        status: 'approved',
        approver_id: 2,
        approver_name: 'Ахмедова Нилуфар Бахтиёровна',
        approved_at: '2026-01-20T10:00:00Z',
        reason: 'Больничный лист',
        created_at: '2026-01-20T09:00:00Z',
        updated_at: '2026-01-20T10:00:00Z'
    },
    {
        id: 5,
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        department_id: 6,
        department_name: 'IT-отдел',
        vacation_type: 'annual',
        start_date: '2026-03-15',
        end_date: '2026-03-28',
        days_count: 14,
        status: 'pending',
        reason: 'Ежегодный отпуск',
        created_at: '2026-02-08T14:00:00Z',
        updated_at: '2026-02-08T14:00:00Z'
    },
    {
        id: 6,
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        department_id: 8,
        department_name: 'Юридический отдел',
        vacation_type: 'study',
        start_date: '2026-04-01',
        end_date: '2026-04-10',
        days_count: 10,
        status: 'draft',
        reason: 'Учебная сессия',
        created_at: '2026-02-11T16:00:00Z',
        updated_at: '2026-02-11T16:00:00Z'
    },
    {
        id: 7,
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        department_id: 5,
        department_name: 'Финансовый отдел',
        vacation_type: 'annual',
        start_date: '2025-08-01',
        end_date: '2025-08-14',
        days_count: 14,
        status: 'approved',
        approver_id: 1,
        approver_name: 'Каримов Рустам Шарипович',
        approved_at: '2025-07-15T09:00:00Z',
        reason: 'Летний отпуск',
        created_at: '2025-07-01T08:00:00Z',
        updated_at: '2025-07-15T09:00:00Z'
    },
    {
        id: 8,
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        department_id: 2,
        department_name: 'Производственный отдел',
        vacation_type: 'unpaid',
        start_date: '2026-02-01',
        end_date: '2026-02-14',
        days_count: 14,
        status: 'approved',
        approver_id: 3,
        approver_name: 'Юлдашев Ботир Камолович',
        approved_at: '2026-01-28T11:00:00Z',
        reason: 'Семейные обстоятельства',
        created_at: '2026-01-25T09:00:00Z',
        updated_at: '2026-01-28T11:00:00Z'
    },
    {
        id: 9,
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        department_id: 5,
        department_name: 'Финансовый отдел',
        vacation_type: 'annual',
        start_date: '2026-05-01',
        end_date: '2026-05-14',
        days_count: 14,
        status: 'pending',
        reason: 'Майские праздники',
        created_at: '2026-02-12T08:00:00Z',
        updated_at: '2026-02-12T08:00:00Z'
    },
    {
        id: 10,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        department_id: 2,
        department_name: 'Производственный отдел',
        vacation_type: 'annual',
        start_date: '2025-07-15',
        end_date: '2025-07-28',
        days_count: 14,
        status: 'approved',
        approver_id: 1,
        approver_name: 'Каримов Рустам Шарипович',
        approved_at: '2025-06-20T10:00:00Z',
        reason: 'Ежегодный отпуск',
        created_at: '2025-06-10T09:00:00Z',
        updated_at: '2025-06-20T10:00:00Z'
    }
];

// Мок-данные балансов отпусков (12 сотрудников, стандарт 24 дня/год для Узбекистана)
const MOCK_VACATION_BALANCES: VacationBalance[] = [
    { id: 1, employee_id: 1, employee_name: 'Каримов Рустам Шарипович', year: 2026, total_days: 24, used_days: 0, pending_days: 0, remaining_days: 24, carried_over_days: 3 },
    { id: 2, employee_id: 2, employee_name: 'Ахмедова Нилуфар Бахтиёровна', year: 2026, total_days: 24, used_days: 10, pending_days: 14, remaining_days: 0, carried_over_days: 0 },
    { id: 3, employee_id: 3, employee_name: 'Юлдашев Ботир Камолович', year: 2026, total_days: 24, used_days: 14, pending_days: 0, remaining_days: 10, carried_over_days: 0 },
    { id: 4, employee_id: 4, employee_name: 'Рахимова Дилноза Алишеровна', year: 2026, total_days: 24, used_days: 14, pending_days: 0, remaining_days: 10, carried_over_days: 0 },
    { id: 5, employee_id: 5, employee_name: 'Назаров Фаррух Бахромович', year: 2026, total_days: 24, used_days: 0, pending_days: 14, remaining_days: 10, carried_over_days: 0 },
    { id: 6, employee_id: 6, employee_name: 'Абдуллаева Гулнора Тахировна', year: 2026, total_days: 24, used_days: 0, pending_days: 0, remaining_days: 24, carried_over_days: 2 },
    { id: 7, employee_id: 7, employee_name: 'Мирзаев Жасур Хамидович', year: 2026, total_days: 24, used_days: 0, pending_days: 14, remaining_days: 10, carried_over_days: 0 },
    { id: 8, employee_id: 8, employee_name: 'Исмоилова Шахло Равшановна', year: 2026, total_days: 24, used_days: 5, pending_days: 0, remaining_days: 19, carried_over_days: 0 },
    { id: 9, employee_id: 9, employee_name: 'Турсунов Ильхом Адхамович', year: 2026, total_days: 24, used_days: 0, pending_days: 0, remaining_days: 24, carried_over_days: 0 },
    { id: 10, employee_id: 10, employee_name: 'Хасанова Малика Обидовна', year: 2026, total_days: 24, used_days: 0, pending_days: 14, remaining_days: 10, carried_over_days: 0 },
    { id: 11, employee_id: 11, employee_name: 'Сафаров Улугбек Шухратович', year: 2026, total_days: 24, used_days: 14, pending_days: 0, remaining_days: 10, carried_over_days: 0 },
    { id: 12, employee_id: 12, employee_name: 'Каримова Зилола Бахтияровна', year: 2026, total_days: 24, used_days: 0, pending_days: 14, remaining_days: 10, carried_over_days: 0 }
];

@Injectable({
    providedIn: 'root'
})
export class VacationService extends ApiService {
    // Vacations CRUD
    getVacations(): Observable<Vacation[]> {
        return of(MOCK_VACATIONS).pipe(delay(300));
    }

    getVacation(id: number): Observable<Vacation> {
        const vacation = MOCK_VACATIONS.find((v) => v.id === id);
        return of(vacation as Vacation).pipe(delay(300));
    }

    createVacation(payload: VacationPayload): Observable<Vacation> {
        const newVacation: Vacation = {
            id: Date.now(),
            employee_id: payload.employee_id || 0,
            employee_name: '',
            vacation_type: (payload.vacation_type as Vacation['vacation_type']) || 'annual',
            start_date: payload.start_date || '',
            end_date: payload.end_date || '',
            days_count: 0,
            status: 'draft',
            reason: payload.reason,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return of(newVacation).pipe(delay(200));
    }

    updateVacation(id: number, payload: VacationPayload): Observable<Vacation> {
        const existing = MOCK_VACATIONS.find((v) => v.id === id);
        const updated: Vacation = {
            ...(existing || { id, employee_id: 0, employee_name: '', vacation_type: 'annual' as const, start_date: '', end_date: '', days_count: 0, status: 'draft' as const }),
            ...payload,
            vacation_type: (payload.vacation_type as Vacation['vacation_type']) || existing?.vacation_type || 'annual',
            updated_at: new Date().toISOString()
        };
        return of(updated).pipe(delay(200));
    }

    deleteVacation(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // Vacation status actions
    approveVacation(id: number): Observable<Vacation> {
        const existing = MOCK_VACATIONS.find((v) => v.id === id);
        const approved: Vacation = {
            ...(existing || { id, employee_id: 0, employee_name: '', vacation_type: 'annual' as const, start_date: '', end_date: '', days_count: 0, status: 'pending' as const }),
            status: 'approved',
            approver_id: 1,
            approver_name: 'Каримов Рустам Шарипович',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return of(approved).pipe(delay(200));
    }

    rejectVacation(id: number, rejectionReason: string): Observable<Vacation> {
        const existing = MOCK_VACATIONS.find((v) => v.id === id);
        const rejected: Vacation = {
            ...(existing || { id, employee_id: 0, employee_name: '', vacation_type: 'annual' as const, start_date: '', end_date: '', days_count: 0, status: 'pending' as const }),
            status: 'rejected',
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
        };
        return of(rejected).pipe(delay(200));
    }

    cancelVacation(id: number): Observable<Vacation> {
        const existing = MOCK_VACATIONS.find((v) => v.id === id);
        const cancelled: Vacation = {
            ...(existing || { id, employee_id: 0, employee_name: '', vacation_type: 'annual' as const, start_date: '', end_date: '', days_count: 0, status: 'approved' as const }),
            status: 'cancelled',
            updated_at: new Date().toISOString()
        };
        return of(cancelled).pipe(delay(200));
    }

    // Vacation balances
    getVacationBalances(): Observable<VacationBalance[]> {
        return of(MOCK_VACATION_BALANCES).pipe(delay(300));
    }

    getVacationBalance(employeeId: number): Observable<VacationBalance> {
        const balance = MOCK_VACATION_BALANCES.find((b) => b.employee_id === employeeId);
        return of(balance as VacationBalance).pipe(delay(300));
    }
}
