import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AttendanceStatus, EmployeeTimesheet, Holiday, TimesheetCorrection, TimesheetDay, TimesheetEntry, TimesheetFilter, TimesheetSummary } from '@/core/interfaces/hrm/timesheet';

// Праздничные дни Узбекистана 2025
const MOCK_HOLIDAYS: Holiday[] = [
    { id: 1, date: '2025-01-01', name: 'Новый год', type: 'national', is_working: false },
    { id: 2, date: '2025-03-08', name: 'Международный женский день', type: 'national', is_working: false },
    { id: 3, date: '2025-03-21', name: 'Навруз', type: 'national', is_working: false },
    { id: 4, date: '2025-05-09', name: 'День памяти и почестей', type: 'national', is_working: false },
    { id: 5, date: '2025-09-01', name: 'День независимости', type: 'national', is_working: false },
    { id: 6, date: '2025-10-01', name: 'День учителя и наставника', type: 'national', is_working: false },
    { id: 7, date: '2025-12-08', name: 'День Конституции', type: 'national', is_working: false }
];

// Данные сотрудников
const EMPLOYEES = [
    { id: 1, name: 'Каримов Рустам Шарипович', code: 'ТН-001', department_name: 'Руководство', position_name: 'Генеральный директор' },
    { id: 2, name: 'Ахмедова Нилуфар Бахтиёровна', code: 'ТН-002', department_name: 'Отдел кадров', position_name: 'Начальник отдела кадров' },
    { id: 3, name: 'Юлдашев Ботир Камолович', code: 'ТН-003', department_name: 'Производственный отдел', position_name: 'Начальник производства' },
    { id: 4, name: 'Рахимова Дилноза Алишеровна', code: 'ТН-004', department_name: 'Финансовый отдел', position_name: 'Главный бухгалтер' },
    { id: 5, name: 'Назаров Фаррух Бахромович', code: 'ТН-005', department_name: 'IT-отдел', position_name: 'Системный администратор' },
    { id: 6, name: 'Абдуллаева Гулнора Тахировна', code: 'ТН-006', department_name: 'Юридический отдел', position_name: 'Юрист' },
    { id: 7, name: 'Мирзаев Жасур Хамидович', code: 'ТН-007', department_name: 'Производственный отдел', position_name: 'Технолог' },
    { id: 8, name: 'Исмоилова Шахло Равшановна', code: 'ТН-008', department_name: 'Отдел контроля качества', position_name: 'Инженер по качеству' },
    { id: 9, name: 'Турсунов Ильхом Адхамович', code: 'ТН-009', department_name: 'Отдел логистики', position_name: 'Менеджер по логистике' },
    { id: 10, name: 'Хасанова Малика Обидовна', code: 'ТН-010', department_name: 'Отдел кадров', position_name: 'Специалист по кадрам' },
    { id: 11, name: 'Сафаров Улугбек Шухратович', code: 'ТН-011', department_name: 'Производственный отдел', position_name: 'Оператор' },
    { id: 12, name: 'Каримова Зилола Бахтияровна', code: 'ТН-012', department_name: 'Финансовый отдел', position_name: 'Бухгалтер' }
];

// Исключения для отдельных сотрудников (отпуск, больничный и т.д.)
// Формат: employee_id -> { date: status }
const EMPLOYEE_EXCEPTIONS: { [empId: number]: { [date: string]: { status: AttendanceStatus; notes?: string } } } = {
    6: {
        '2025-01-13': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-14': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-15': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-16': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-17': { status: 'vacation', notes: 'Ежегодный отпуск' }
    },
    9: {
        '2025-01-20': { status: 'business_trip', notes: 'Командировка в Наманган' },
        '2025-01-21': { status: 'business_trip', notes: 'Командировка в Наманган' },
        '2025-01-22': { status: 'business_trip', notes: 'Командировка в Наманган' }
    },
    11: {
        '2025-01-27': { status: 'sick_leave', notes: 'Больничный лист №0234' },
        '2025-01-28': { status: 'sick_leave', notes: 'Больничный лист №0234' },
        '2025-01-29': { status: 'sick_leave', notes: 'Больничный лист №0234' },
        '2025-01-30': { status: 'sick_leave', notes: 'Больничный лист №0234' },
        '2025-01-31': { status: 'sick_leave', notes: 'Больничный лист №0234' }
    },
    5: {
        '2025-01-10': { status: 'remote', notes: 'Удалённая работа (настройка серверов)' },
        '2025-01-24': { status: 'remote', notes: 'Удалённая работа' }
    },
    3: {
        '2025-01-23': { status: 'late', notes: 'Опоздание на 25 минут' }
    },
    10: {
        '2025-01-06': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-07': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-08': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-09': { status: 'vacation', notes: 'Ежегодный отпуск' },
        '2025-01-10': { status: 'vacation', notes: 'Ежегодный отпуск' }
    }
};

// Генерация дней за январь 2025
function generateDays(employeeId: number): TimesheetDay[] {
    const days: TimesheetDay[] = [];
    const holidayDates = new Set(MOCK_HOLIDAYS.map((h) => h.date));
    const holidayMap: { [date: string]: string } = {};
    MOCK_HOLIDAYS.forEach((h) => {
        holidayMap[h.date] = h.name;
    });
    const exceptions = EMPLOYEE_EXCEPTIONS[employeeId] || {};

    for (let d = 1; d <= 31; d++) {
        const dateStr = `2025-01-${d.toString().padStart(2, '0')}`;
        const date = new Date(2025, 0, d);
        const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = holidayDates.has(dateStr);

        let status: AttendanceStatus;
        let checkIn: string | undefined;
        let checkOut: string | undefined;
        let workedHours: number | undefined;
        let overtimeHours: number | undefined;
        let notes: string | undefined;

        if (exceptions[dateStr]) {
            status = exceptions[dateStr].status;
            notes = exceptions[dateStr].notes;
            if (status === 'remote') {
                checkIn = '09:00';
                checkOut = '18:00';
                workedHours = 8;
                overtimeHours = 0;
            } else if (status === 'late') {
                checkIn = '09:25';
                checkOut = '18:00';
                workedHours = 7.6;
                overtimeHours = 0;
            }
        } else if (isHoliday) {
            status = 'holiday';
            notes = holidayMap[dateStr];
        } else if (isWeekend) {
            status = 'day_off';
        } else {
            status = 'present';
            checkIn = '09:00';
            checkOut = '18:00';
            workedHours = 8;
            overtimeHours = 0;
        }

        days.push({
            date: dateStr,
            day_of_week: dayOfWeek,
            is_weekend: isWeekend,
            is_holiday: isHoliday,
            holiday_name: isHoliday ? holidayMap[dateStr] : undefined,
            status,
            check_in: checkIn,
            check_out: checkOut,
            worked_hours: workedHours,
            overtime_hours: overtimeHours,
            notes
        });
    }
    return days;
}

// Подсчёт итогов
function calculateSummary(days: TimesheetDay[]): TimesheetSummary {
    let totalWorkDays = 0;
    let daysPresent = 0;
    let daysAbsent = 0;
    let daysVacation = 0;
    let daysSickLeave = 0;
    let daysBusinessTrip = 0;
    let daysRemote = 0;
    let totalWorkedHours = 0;
    let totalOvertimeHours = 0;

    for (const day of days) {
        if (!day.is_weekend && !day.is_holiday) {
            totalWorkDays++;
        }
        switch (day.status) {
            case 'present':
            case 'late':
            case 'left_early':
                daysPresent++;
                break;
            case 'absent':
                daysAbsent++;
                break;
            case 'vacation':
                daysVacation++;
                break;
            case 'sick_leave':
                daysSickLeave++;
                break;
            case 'business_trip':
                daysBusinessTrip++;
                break;
            case 'remote':
                daysRemote++;
                break;
        }
        if (day.worked_hours) {
            totalWorkedHours += day.worked_hours;
        }
        if (day.overtime_hours) {
            totalOvertimeHours += day.overtime_hours;
        }
    }

    const expectedHours = (daysPresent + daysRemote) * 8;
    const totalUndertimeHours = expectedHours > totalWorkedHours ? Math.round((expectedHours - totalWorkedHours) * 10) / 10 : 0;

    return {
        total_work_days: totalWorkDays,
        days_present: daysPresent,
        days_absent: daysAbsent,
        days_vacation: daysVacation,
        days_sick_leave: daysSickLeave,
        days_business_trip: daysBusinessTrip,
        days_remote: daysRemote,
        total_worked_hours: Math.round(totalWorkedHours * 10) / 10,
        total_overtime_hours: Math.round(totalOvertimeHours * 10) / 10,
        total_undertime_hours: totalUndertimeHours
    };
}

// Мок-данные: табели сотрудников за январь 2025
const MOCK_TIMESHEETS: EmployeeTimesheet[] = EMPLOYEES.map((emp) => {
    const days = generateDays(emp.id);
    return {
        employee_id: emp.id,
        employee_name: emp.name,
        employee_code: emp.code,
        department_name: emp.department_name,
        position_name: emp.position_name,
        month: 1,
        year: 2025,
        days,
        summary: calculateSummary(days)
    };
});

// Мок-данные: корректировки табеля
const MOCK_CORRECTIONS: TimesheetCorrection[] = [
    {
        id: 1,
        timesheet_entry_id: 101,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        date: '2025-01-23',
        old_status: 'absent',
        new_status: 'late',
        old_check_in: undefined,
        new_check_in: '09:25',
        old_check_out: undefined,
        new_check_out: '18:00',
        reason: 'Задержка из-за ДТП на дороге',
        requested_at: '2025-01-23T10:00:00',
        requested_by: 3,
        status: 'approved',
        approved_by: 2,
        approved_at: '2025-01-23T11:30:00'
    },
    {
        id: 2,
        timesheet_entry_id: 205,
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        date: '2025-01-15',
        old_status: 'absent',
        new_status: 'present',
        new_check_in: '09:00',
        new_check_out: '18:00',
        reason: 'Система не зафиксировала приход',
        requested_at: '2025-01-16T09:15:00',
        requested_by: 7,
        status: 'approved',
        approved_by: 2,
        approved_at: '2025-01-16T10:00:00'
    },
    {
        id: 3,
        timesheet_entry_id: 310,
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        date: '2025-01-28',
        old_status: 'present',
        new_status: 'remote',
        old_check_in: '09:00',
        new_check_in: '09:00',
        old_check_out: '18:00',
        new_check_out: '18:00',
        reason: 'Работала из дома по согласованию с руководителем',
        requested_at: '2025-01-29T09:00:00',
        requested_by: 12,
        status: 'pending'
    }
];

@Injectable({
    providedIn: 'root'
})
export class TimesheetService extends ApiService {
    // Табели учёта
    getTimesheets(filter: TimesheetFilter): Observable<EmployeeTimesheet[]> {
        let result = [...MOCK_TIMESHEETS];
        if (filter.department_id) {
            const deptMap: { [id: number]: string } = {
                1: 'Руководство',
                2: 'Производственный отдел',
                3: 'Отдел контроля качества',
                4: 'Отдел логистики',
                5: 'Финансовый отдел',
                6: 'IT-отдел',
                7: 'Отдел кадров',
                8: 'Юридический отдел'
            };
            const deptName = deptMap[filter.department_id];
            if (deptName) {
                result = result.filter((t) => t.department_name === deptName);
            }
        }
        if (filter.employee_id) {
            result = result.filter((t) => t.employee_id === filter.employee_id);
        }
        return of(result).pipe(delay(300));
    }

    // Обновление записи табеля
    updateTimesheetEntry(entryId: number, data: Partial<TimesheetEntry>): Observable<TimesheetEntry> {
        const updated: TimesheetEntry = {
            id: entryId,
            employee_id: data.employee_id || 0,
            employee_name: data.employee_name || '',
            department_id: data.department_id || 0,
            department_name: data.department_name || '',
            position_name: data.position_name || '',
            date: data.date || '',
            status: data.status || 'present',
            check_in: data.check_in,
            check_out: data.check_out,
            worked_hours: data.worked_hours,
            overtime_hours: data.overtime_hours,
            notes: data.notes
        };
        return of(updated).pipe(delay(200));
    }

    // Праздничные дни
    getHolidays(year?: number): Observable<Holiday[]> {
        return of(MOCK_HOLIDAYS).pipe(delay(300));
    }

    createHoliday(holiday: Omit<Holiday, 'id'>): Observable<Holiday> {
        const newHoliday: Holiday = { id: Date.now(), ...holiday };
        return of(newHoliday).pipe(delay(200));
    }

    deleteHoliday(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // Корректировки
    requestCorrection(data: Omit<TimesheetCorrection, 'id' | 'status' | 'requested_at'>): Observable<TimesheetCorrection> {
        const correction: TimesheetCorrection = {
            ...data,
            id: Date.now(),
            status: 'pending',
            requested_at: new Date().toISOString()
        };
        return of(correction).pipe(delay(200));
    }

    approveCorrection(id: number): Observable<TimesheetCorrection> {
        const found = MOCK_CORRECTIONS.find((c) => c.id === id);
        const approved: TimesheetCorrection = {
            ...(found || MOCK_CORRECTIONS[0]),
            id,
            status: 'approved',
            approved_by: 2,
            approved_at: new Date().toISOString()
        };
        return of(approved).pipe(delay(200));
    }

    rejectCorrection(id: number, reason: string): Observable<TimesheetCorrection> {
        const found = MOCK_CORRECTIONS.find((c) => c.id === id);
        const rejected: TimesheetCorrection = {
            ...(found || MOCK_CORRECTIONS[0]),
            id,
            status: 'rejected',
            approved_by: 2,
            approved_at: new Date().toISOString(),
            rejection_reason: reason
        };
        return of(rejected).pipe(delay(200));
    }

    // Экспорт
    exportToExcel(filter: TimesheetFilter): Observable<Blob> {
        return of(new Blob()).pipe(delay(300));
    }
}
