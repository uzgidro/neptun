import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Vacation, VacationPayload, VacationBalance } from '@/core/interfaces/hrm/vacation';

const API_URL = BASE_URL + '/hrm/vacations';
const USE_MOCK = !BASE_URL;

const MOCK_VACATIONS: Vacation[] = [
    {
        id: 101,
        employee_id: 101,
        employee_name: 'Каримов Алишер Бахтиёрович',
        department_id: 10,
        department_name: 'Служба эксплуатации Молокозавода «Чарвак»',
        vacation_type: 'annual',
        start_date: '2026-03-15',
        end_date: '2026-03-29',
        days_count: 14,
        status: 'pending',
        reason: 'Ежегодный оплачиваемый отпуск',
        created_at: '2026-03-04T08:30:00Z',
        updated_at: '2026-03-04T08:30:00Z'
    },
    {
        id: 102,
        employee_id: 102,
        employee_name: 'Мирзаева Дильшод Рустамович',
        department_id: 20,
        department_name: 'Молокозавод «Туямуюн»',
        vacation_type: 'annual',
        start_date: '2026-02-20',
        end_date: '2026-03-06',
        days_count: 14,
        status: 'approved',
        approver_id: 50,
        approver_name: 'Исмоилов Бахром Тахирович',
        approved_at: '2026-02-15T10:30:00Z',
        reason: 'Ежегодный оплачиваемый отпуск',
        created_at: '2026-02-10T09:00:00Z',
        updated_at: '2026-02-15T10:30:00Z'
    },
    {
        id: 103,
        employee_id: 103,
        employee_name: 'Юлдашева Нигора Абдуллаевна',
        department_id: 30,
        department_name: 'Бухгалтерия',
        vacation_type: 'sick',
        start_date: '2026-03-01',
        end_date: '2026-03-07',
        days_count: 7,
        status: 'approved',
        approver_id: 50,
        approver_name: 'Исмоилов Бахром Тахирович',
        approved_at: '2026-03-01T08:00:00Z',
        reason: 'Больничный лист',
        created_at: '2026-03-01T07:45:00Z',
        updated_at: '2026-03-01T08:00:00Z'
    },
    {
        id: 104,
        employee_id: 105,
        employee_name: 'Хасанов Бахтиёр Насруллаевич',
        department_id: 10,
        department_name: 'Техническое управление',
        vacation_type: 'annual',
        start_date: '2026-04-01',
        end_date: '2026-04-21',
        days_count: 21,
        status: 'pending',
        reason: 'Ежегодный оплачиваемый отпуск',
        created_at: '2026-03-02T11:00:00Z',
        updated_at: '2026-03-02T11:00:00Z'
    },
    {
        id: 105,
        employee_id: 104,
        employee_name: 'Рахматуллаев Сардор Ильхомович',
        department_id: 15,
        department_name: 'Молокозавод «Ходжикент»',
        vacation_type: 'study',
        start_date: '2026-05-10',
        end_date: '2026-05-24',
        days_count: 14,
        status: 'draft',
        reason: 'Учебный отпуск — сессия в ТГТУ',
        created_at: '2026-03-03T14:00:00Z',
        updated_at: '2026-03-03T14:00:00Z'
    },
    {
        id: 106,
        employee_id: 106,
        employee_name: 'Назаров Улугбек Хамидович',
        department_id: 40,
        department_name: 'Молокозавод «Фархад»',
        vacation_type: 'annual',
        start_date: '2026-02-01',
        end_date: '2026-02-14',
        days_count: 14,
        status: 'rejected',
        approver_id: 50,
        approver_name: 'Исмоилов Бахром Тахирович',
        rejection_reason: 'В указанный период проводятся плановые работы на производстве, необходимо присутствие инженерного состава',
        reason: 'Ежегодный оплачиваемый отпуск',
        created_at: '2026-01-20T09:00:00Z',
        updated_at: '2026-01-22T16:00:00Z'
    },
    {
        id: 107,
        employee_id: 107,
        employee_name: 'Абдурахмонова Малика Тахировна',
        department_id: 50,
        department_name: 'HR-департамент',
        vacation_type: 'unpaid',
        start_date: '2026-03-10',
        end_date: '2026-03-14',
        days_count: 5,
        status: 'approved',
        approver_id: 50,
        approver_name: 'Исмоилов Бахром Тахирович',
        approved_at: '2026-03-05T09:00:00Z',
        reason: 'Семейные обстоятельства',
        created_at: '2026-03-03T10:00:00Z',
        updated_at: '2026-03-05T09:00:00Z'
    },
    {
        id: 108,
        employee_id: 108,
        employee_name: 'Тургунов Жавлон Равшанович',
        department_id: 10,
        department_name: 'Служба эксплуатации Молокозавода «Чарвак»',
        vacation_type: 'annual',
        start_date: '2026-01-15',
        end_date: '2026-01-28',
        days_count: 14,
        status: 'cancelled',
        reason: 'Ежегодный оплачиваемый отпуск',
        created_at: '2026-01-05T08:00:00Z',
        updated_at: '2026-01-10T12:00:00Z'
    }
];

const MOCK_BALANCES: VacationBalance[] = [
    {
        id: 1,
        employee_id: 101,
        employee_name: 'Каримов Алишер Бахтиёрович',
        year: 2026,
        total_days: 30,
        used_days: 0,
        pending_days: 14,
        remaining_days: 16,
        carried_over_days: 6
    },
    {
        id: 2,
        employee_id: 102,
        employee_name: 'Мирзаева Дильшод Рустамович',
        year: 2026,
        total_days: 28,
        used_days: 14,
        pending_days: 0,
        remaining_days: 14,
        carried_over_days: 4
    },
    {
        id: 3,
        employee_id: 103,
        employee_name: 'Юлдашева Нигора Абдуллаевна',
        year: 2026,
        total_days: 36,
        used_days: 7,
        pending_days: 0,
        remaining_days: 29,
        carried_over_days: 12
    },
    {
        id: 4,
        employee_id: 104,
        employee_name: 'Рахматуллаев Сардор Ильхомович',
        year: 2026,
        total_days: 24,
        used_days: 0,
        pending_days: 14,
        remaining_days: 10,
        carried_over_days: 0
    },
    {
        id: 5,
        employee_id: 105,
        employee_name: 'Хасанов Бахтиёр Насруллаевич',
        year: 2026,
        total_days: 30,
        used_days: 0,
        pending_days: 21,
        remaining_days: 9,
        carried_over_days: 6
    }
];

const MOCK_PENDING: Vacation[] = MOCK_VACATIONS.filter((v) => v.status === 'pending');

@Injectable({
    providedIn: 'root'
})
export class VacationService {
    private http = inject(HttpClient);

    getAll(params?: { status?: string; year?: number }): Observable<Vacation[]> {
        if (USE_MOCK) {
            let filtered = [...MOCK_VACATIONS];
            if (params?.status) filtered = filtered.filter((v) => v.status === params.status);
            if (params?.year) filtered = filtered.filter((v) => v.start_date.startsWith(params.year!.toString()));
            return of(filtered).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.year) httpParams = httpParams.set('year', params.year.toString());
        return this.http.get<Vacation[]>(API_URL, { params: httpParams });
    }

    getById(id: number): Observable<Vacation> {
        if (USE_MOCK) return of(MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0]).pipe(delay(200));
        return this.http.get<Vacation>(`${API_URL}/${id}`);
    }

    create(payload: VacationPayload): Observable<Vacation> {
        if (USE_MOCK)
            return of({
                id: 200,
                employee_id: payload.employee_id || 101,
                employee_name: 'Каримов Алишер Бахтиёрович',
                vacation_type: (payload.vacation_type as Vacation['vacation_type']) || 'annual',
                start_date: payload.start_date || '2026-04-01',
                end_date: payload.end_date || '2026-04-14',
                days_count: 14,
                status: 'draft',
                reason: payload.reason || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).pipe(delay(200));
        return this.http.post<Vacation>(API_URL, payload);
    }

    update(id: number, payload: Partial<VacationPayload>): Observable<Vacation> {
        if (USE_MOCK) {
            const existing = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({ ...existing, ...payload, updated_at: new Date().toISOString() } as Vacation).pipe(delay(200));
        }
        return this.http.patch<Vacation>(`${API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    approve(id: number): Observable<Vacation> {
        if (USE_MOCK) {
            const existing = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({
                ...existing,
                status: 'approved' as const,
                approver_id: 50,
                approver_name: 'Исмоилов Бахром Тахирович',
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).pipe(delay(200));
        }
        return this.http.post<Vacation>(`${API_URL}/${id}/approve`, {});
    }

    reject(id: number, reason: string): Observable<Vacation> {
        if (USE_MOCK) {
            const existing = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({
                ...existing,
                status: 'rejected' as const,
                rejection_reason: reason,
                approver_id: 50,
                approver_name: 'Исмоилов Бахром Тахирович',
                updated_at: new Date().toISOString()
            }).pipe(delay(200));
        }
        return this.http.post<Vacation>(`${API_URL}/${id}/reject`, { reason });
    }

    cancel(id: number): Observable<Vacation> {
        if (USE_MOCK) {
            const existing = MOCK_VACATIONS.find((v) => v.id === id) || MOCK_VACATIONS[0];
            return of({
                ...existing,
                status: 'cancelled' as const,
                updated_at: new Date().toISOString()
            }).pipe(delay(200));
        }
        return this.http.post<Vacation>(`${API_URL}/${id}/cancel`, {});
    }

    getBalance(employeeId: number, year?: number): Observable<VacationBalance> {
        if (USE_MOCK) return of(MOCK_BALANCES.find((b) => b.employee_id === employeeId) || MOCK_BALANCES[0]).pipe(delay(200));
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        return this.http.get<VacationBalance>(`${API_URL}/balance/${employeeId}`, { params });
    }

    getAllBalances(year?: number): Observable<VacationBalance[]> {
        if (USE_MOCK) return of(MOCK_BALANCES).pipe(delay(200));
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        return this.http.get<VacationBalance[]>(`${API_URL}/balances`, { params });
    }

    getPendingApprovals(): Observable<Vacation[]> {
        if (USE_MOCK) return of(MOCK_PENDING).pipe(delay(200));
        return this.http.get<Vacation[]>(`${API_URL}/pending`);
    }

    getCalendar(month: number, year: number): Observable<Vacation[]> {
        if (USE_MOCK) {
            const filtered = MOCK_VACATIONS.filter((v) => {
                const startDate = new Date(v.start_date);
                const endDate = new Date(v.end_date);
                const monthStart = new Date(year, month - 1, 1);
                const monthEnd = new Date(year, month, 0);
                return startDate <= monthEnd && endDate >= monthStart;
            });
            return of(filtered).pipe(delay(200));
        }
        const params = new HttpParams().set('month', month.toString()).set('year', year.toString());
        return this.http.get<Vacation[]>(`${API_URL}/calendar`, { params });
    }
}
