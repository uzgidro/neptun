import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { EmployeeTimesheet, TimesheetEntry, Holiday, TimesheetFilter, TimesheetCorrection, TimesheetDay } from '@/core/interfaces/hrm/timesheet';
import { HttpParams } from '@angular/common/http';

const TIMESHEET = '/hrm/timesheet';
const HOLIDAYS = '/hrm/holidays';
const USE_MOCK = !BASE_URL;

function generateDays(month: number, year: number): TimesheetDay[] {
    const days: TimesheetDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const workStatuses: TimesheetDay['status'][] = ['present', 'present', 'present', 'present', 'present', 'remote', 'vacation', 'sick_leave', 'business_trip'];
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const dow = date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const status = isWeekend ? 'day_off' as const : workStatuses[d % workStatuses.length];
        days.push({
            date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            day_of_week: dow, is_weekend: isWeekend, is_holiday: false,
            status, check_in: isWeekend ? undefined : '08:00', check_out: isWeekend ? undefined : '17:00',
            worked_hours: isWeekend ? 0 : 8
        });
    }
    return days;
}

function mockTimesheets(filter: TimesheetFilter): EmployeeTimesheet[] {
    const employees = [
        { id: 1, name: 'Каримов Бахтиёр Рустамович', code: 'EMP-001', dept: 'Чарвакская ГЭС', pos: 'Главный инженер' },
        { id: 2, name: 'Султанова Дилноза Камолидиновна', code: 'EMP-002', dept: 'Центральный аппарат', pos: 'Начальник отдела' },
        { id: 3, name: 'Рахимов Отабек Шухратович', code: 'EMP-003', dept: 'Фархадская ГЭС', pos: 'Инженер-энергетик' },
        { id: 4, name: 'Абдуллаев Жасур Тохирович', code: 'EMP-004', dept: 'Ходжикентская ГЭС', pos: 'Оператор' },
        { id: 5, name: 'Мирзаева Нодира Бахтиёровна', code: 'EMP-005', dept: 'Центральный аппарат', pos: 'HR-специалист' }
    ];
    return employees.map(e => {
        const days = generateDays(filter.month, filter.year);
        const present = days.filter(d => d.status === 'present' || d.status === 'remote').length;
        return {
            employee_id: e.id, employee_name: e.name, employee_code: e.code, department_name: e.dept, position_name: e.pos,
            month: filter.month, year: filter.year, days,
            summary: {
                total_work_days: days.filter(d => !d.is_weekend && !d.is_holiday).length,
                days_present: present, days_absent: 1, days_vacation: days.filter(d => d.status === 'vacation').length,
                days_sick_leave: days.filter(d => d.status === 'sick_leave').length, days_business_trip: days.filter(d => d.status === 'business_trip').length,
                days_remote: days.filter(d => d.status === 'remote').length, total_worked_hours: present * 8, total_overtime_hours: 4, total_undertime_hours: 0
            }
        };
    });
}

const MOCK_HOLIDAYS: Holiday[] = [
    { id: 1, date: '2026-01-01', name: 'Новый год', type: 'national', is_working: false },
    { id: 2, date: '2026-03-08', name: 'Международный женский день', type: 'national', is_working: false },
    { id: 3, date: '2026-03-21', name: 'Навруз', type: 'national', is_working: false },
    { id: 4, date: '2026-05-09', name: 'День памяти и почестей', type: 'national', is_working: false },
    { id: 5, date: '2026-09-01', name: 'День независимости', type: 'national', is_working: false },
    { id: 6, date: '2026-10-01', name: 'День учителя', type: 'national', is_working: false },
    { id: 7, date: '2026-12-08', name: 'День Конституции', type: 'national', is_working: false }
];

@Injectable({
    providedIn: 'root'
})
export class TimesheetService extends ApiService {
    getTimesheets(filter: TimesheetFilter): Observable<EmployeeTimesheet[]> {
        if (USE_MOCK) return of(mockTimesheets(filter)).pipe(delay(300));
        let params = new HttpParams().set('month', filter.month.toString()).set('year', filter.year.toString());
        if (filter.department_id) params = params.set('department_id', filter.department_id.toString());
        if (filter.employee_id) params = params.set('employee_id', filter.employee_id.toString());
        return this.http.get<EmployeeTimesheet[]>(BASE_URL + TIMESHEET, { params });
    }

    updateTimesheetEntry(entryId: number, data: Partial<TimesheetEntry>): Observable<TimesheetEntry> {
        if (USE_MOCK) return of({ id: entryId, employee_id: 1, employee_name: '', department_id: 1, department_name: '', position_name: '', date: '', status: 'present', ...data } as TimesheetEntry).pipe(delay(200));
        return this.http.patch<TimesheetEntry>(BASE_URL + TIMESHEET + '/' + entryId, data);
    }

    getHolidays(year?: number): Observable<Holiday[]> {
        if (USE_MOCK) return of(MOCK_HOLIDAYS).pipe(delay(200));
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        return this.http.get<Holiday[]>(BASE_URL + HOLIDAYS, { params });
    }

    createHoliday(holiday: Omit<Holiday, 'id'>): Observable<Holiday> {
        if (USE_MOCK) return of({ ...holiday, id: Date.now() } as Holiday).pipe(delay(200));
        return this.http.post<Holiday>(BASE_URL + HOLIDAYS, holiday);
    }

    deleteHoliday(id: number): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.delete(BASE_URL + HOLIDAYS + '/' + id);
    }

    getCorrections(): Observable<TimesheetCorrection[]> {
        if (USE_MOCK) return of([]).pipe(delay(200));
        return this.http.get<TimesheetCorrection[]>(BASE_URL + TIMESHEET + '/corrections');
    }

    requestCorrection(data: Omit<TimesheetCorrection, 'id' | 'status' | 'requested_at'>): Observable<TimesheetCorrection> {
        if (USE_MOCK) return of({ ...data, id: Date.now(), status: 'pending', requested_at: new Date().toISOString() } as TimesheetCorrection).pipe(delay(200));
        return this.http.post<TimesheetCorrection>(BASE_URL + TIMESHEET + '/corrections', data);
    }

    approveCorrection(id: number): Observable<TimesheetCorrection> {
        if (USE_MOCK) return of({ id, status: 'approved' } as TimesheetCorrection).pipe(delay(200));
        return this.http.post<TimesheetCorrection>(BASE_URL + TIMESHEET + '/corrections/' + id + '/approve', {});
    }

    rejectCorrection(id: number, reason: string): Observable<TimesheetCorrection> {
        if (USE_MOCK) return of({ id, status: 'rejected', rejection_reason: reason } as TimesheetCorrection).pipe(delay(200));
        return this.http.post<TimesheetCorrection>(BASE_URL + TIMESHEET + '/corrections/' + id + '/reject', { reason });
    }

    exportToExcel(filter: TimesheetFilter): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock'], { type: 'application/vnd.ms-excel' })).pipe(delay(200));
        let params = new HttpParams().set('month', filter.month.toString()).set('year', filter.year.toString());
        if (filter.department_id) params = params.set('department_id', filter.department_id.toString());
        return this.http.get(BASE_URL + TIMESHEET + '/export', { params, responseType: 'blob' });
    }
}
