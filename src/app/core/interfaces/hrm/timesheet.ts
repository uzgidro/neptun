// Timesheet - Табель учёта рабочего времени

export interface TimesheetEntry {
    id: number;
    employee_id: number;
    employee_name: string;
    department_id: number;
    department_name: string;
    position_name: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    check_in?: string; // HH:mm
    check_out?: string; // HH:mm
    worked_hours?: number;
    overtime_hours?: number;
    break_minutes?: number;
    notes?: string;
    approved_by?: number;
    approved_at?: string;
}

export interface TimesheetDay {
    date: string;
    day_of_week: number; // 0-6, 0 = Sunday
    is_weekend: boolean;
    is_holiday: boolean;
    holiday_name?: string;
    status: AttendanceStatus;
    check_in?: string;
    check_out?: string;
    worked_hours?: number;
    overtime_hours?: number;
    notes?: string;
}

export interface EmployeeTimesheet {
    employee_id: number;
    employee_name: string;
    employee_code: string;
    department_name: string;
    position_name: string;
    month: number;
    year: number;
    days: TimesheetDay[];
    summary: TimesheetSummary;
}

export interface TimesheetSummary {
    total_work_days: number;
    days_present: number;
    days_absent: number;
    days_vacation: number;
    days_sick_leave: number;
    days_business_trip: number;
    days_remote: number;
    total_worked_hours: number;
    total_overtime_hours: number;
    total_undertime_hours: number;
}

export interface MonthlyTimesheetReport {
    month: number;
    year: number;
    department_id?: number;
    department_name?: string;
    employees: EmployeeTimesheet[];
    totals: {
        total_employees: number;
        avg_attendance_rate: number;
        total_worked_hours: number;
        total_overtime_hours: number;
    };
}

export interface Holiday {
    id: number;
    date: string;
    name: string;
    type: 'national' | 'religious' | 'company';
    is_working: boolean;
}

export interface WorkSchedule {
    id: number;
    name: string;
    description?: string;
    work_days: number[]; // 0-6, days of week
    work_start: string; // HH:mm
    work_end: string; // HH:mm
    break_start?: string;
    break_end?: string;
    break_duration: number; // minutes
    is_default: boolean;
}

export interface TimesheetFilter {
    month: number;
    year: number;
    department_id?: number;
    employee_id?: number;
    status?: AttendanceStatus;
}

export interface TimesheetCorrection {
    id: number;
    timesheet_entry_id: number;
    employee_id: number;
    employee_name: string;
    date: string;
    old_status: AttendanceStatus;
    new_status: AttendanceStatus;
    old_check_in?: string;
    new_check_in?: string;
    old_check_out?: string;
    new_check_out?: string;
    reason: string;
    requested_at: string;
    requested_by: number;
    status: CorrectionStatus;
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
}

// Types
export type AttendanceStatus =
    | 'present' // Присутствует
    | 'absent' // Отсутствует (без причины)
    | 'vacation' // Отпуск
    | 'sick_leave' // Больничный
    | 'business_trip' // Командировка
    | 'remote' // Удалённая работа
    | 'day_off' // Выходной
    | 'holiday' // Праздник
    | 'unpaid_leave' // Отпуск без сохранения з/п
    | 'late' // Опоздание
    | 'left_early'; // Ранний уход

export type CorrectionStatus = 'pending' | 'approved' | 'rejected';

// Constants
export const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string; color: string; icon: string }[] = [
    { value: 'present', label: 'Присутствует', color: 'green', icon: 'pi-check-circle' },
    { value: 'absent', label: 'Отсутствует', color: 'red', icon: 'pi-times-circle' },
    { value: 'vacation', label: 'Отпуск', color: 'blue', icon: 'pi-sun' },
    { value: 'sick_leave', label: 'Больничный', color: 'orange', icon: 'pi-heart' },
    { value: 'business_trip', label: 'Командировка', color: 'purple', icon: 'pi-car' },
    { value: 'remote', label: 'Удалённо', color: 'cyan', icon: 'pi-home' },
    { value: 'day_off', label: 'Выходной', color: 'gray', icon: 'pi-moon' },
    { value: 'holiday', label: 'Праздник', color: 'pink', icon: 'pi-star' },
    { value: 'unpaid_leave', label: 'Без сохр. з/п', color: 'yellow', icon: 'pi-wallet' },
    { value: 'late', label: 'Опоздание', color: 'amber', icon: 'pi-clock' },
    { value: 'left_early', label: 'Ранний уход', color: 'amber', icon: 'pi-sign-out' }
];

export const DAYS_OF_WEEK: { value: number; label: string; short: string }[] = [
    { value: 0, label: 'Воскресенье', short: 'Вс' },
    { value: 1, label: 'Понедельник', short: 'Пн' },
    { value: 2, label: 'Вторник', short: 'Вт' },
    { value: 3, label: 'Среда', short: 'Ср' },
    { value: 4, label: 'Четверг', short: 'Чт' },
    { value: 5, label: 'Пятница', short: 'Пт' },
    { value: 6, label: 'Суббота', short: 'Сб' }
];

export const MONTHS: { value: number; label: string }[] = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' }
];
