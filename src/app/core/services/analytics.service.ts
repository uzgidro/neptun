import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AttendanceReport, HRAnalyticsDashboard, ReportFilter, SalaryReport, TurnoverReport } from '@/core/interfaces/hrm/analytics';

// Мок-данные: панель аналитики
const MOCK_DASHBOARD: HRAnalyticsDashboard = {
    total_employees: 247,
    active_employees: 240,
    new_hires_this_month: 3,
    terminations_this_month: 1,
    turnover_rate: 3.2,
    average_tenure: 4.5,
    headcount_by_department: [
        { department_id: 1, department_name: 'Руководство', headcount: 5, percentage: 2.0 },
        { department_id: 2, department_name: 'Производственный отдел', headcount: 78, percentage: 31.6 },
        { department_id: 3, department_name: 'Отдел контроля качества', headcount: 24, percentage: 9.7 },
        { department_id: 4, department_name: 'Отдел логистики', headcount: 32, percentage: 13.0 },
        { department_id: 5, department_name: 'Финансовый отдел', headcount: 18, percentage: 7.3 },
        { department_id: 6, department_name: 'IT-отдел', headcount: 22, percentage: 8.9 },
        { department_id: 7, department_name: 'Отдел кадров', headcount: 15, percentage: 6.1 },
        { department_id: 8, department_name: 'Юридический отдел', headcount: 12, percentage: 4.9 }
    ],
    headcount_by_position: [
        { position_id: 1, position_name: 'Генеральный директор', headcount: 1, percentage: 0.4 },
        { position_id: 2, position_name: 'Начальник отдела', headcount: 8, percentage: 3.2 },
        { position_id: 3, position_name: 'Инженер', headcount: 45, percentage: 18.2 },
        { position_id: 4, position_name: 'Оператор', headcount: 62, percentage: 25.1 },
        { position_id: 5, position_name: 'Специалист', headcount: 38, percentage: 15.4 },
        { position_id: 6, position_name: 'Технолог', headcount: 22, percentage: 8.9 },
        { position_id: 7, position_name: 'Бухгалтер', headcount: 12, percentage: 4.9 },
        { position_id: 8, position_name: 'Менеджер', headcount: 18, percentage: 7.3 },
        { position_id: 9, position_name: 'Юрист', headcount: 8, percentage: 3.2 },
        { position_id: 10, position_name: 'Системный администратор', headcount: 6, percentage: 2.4 }
    ],
    gender_distribution: {
        male: 143,
        female: 104,
        male_percentage: 58,
        female_percentage: 42
    },
    age_distribution: [
        { age_group: '18-25', count: 32, percentage: 13.0 },
        { age_group: '26-35', count: 78, percentage: 31.6 },
        { age_group: '36-45', count: 72, percentage: 29.1 },
        { age_group: '46-55', count: 45, percentage: 18.2 },
        { age_group: '56+', count: 20, percentage: 8.1 }
    ],
    tenure_distribution: [
        { tenure_group: 'До 1 года', count: 28, percentage: 11.3 },
        { tenure_group: '1-3 года', count: 55, percentage: 22.3 },
        { tenure_group: '3-5 лет', count: 68, percentage: 27.5 },
        { tenure_group: '5-10 лет', count: 62, percentage: 25.1 },
        { tenure_group: 'Более 10 лет', count: 34, percentage: 13.8 }
    ]
};

// Мок-данные: отчёт по текучести кадров
const MOCK_TURNOVER_REPORT: TurnoverReport = {
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    total_employees_start: 245,
    total_employees_end: 247,
    new_hires: 3,
    terminations: 1,
    voluntary_terminations: 1,
    involuntary_terminations: 0,
    turnover_rate: 3.2,
    retention_rate: 96.8,
    terminations_by_department: [
        { department_id: 2, department_name: 'Производственный отдел', terminations: 1, turnover_rate: 1.3 },
        { department_id: 4, department_name: 'Отдел логистики', terminations: 0, turnover_rate: 0 },
        { department_id: 6, department_name: 'IT-отдел', terminations: 0, turnover_rate: 0 },
        { department_id: 7, department_name: 'Отдел кадров', terminations: 0, turnover_rate: 0 }
    ],
    terminations_by_reason: [
        { reason: 'По собственному желанию', count: 1, percentage: 100 },
        { reason: 'По соглашению сторон', count: 0, percentage: 0 },
        { reason: 'Сокращение штата', count: 0, percentage: 0 },
        { reason: 'Истечение срока договора', count: 0, percentage: 0 },
        { reason: 'Нарушение трудовой дисциплины', count: 0, percentage: 0 }
    ]
};

// Мок-данные: отчёт по посещаемости
const MOCK_ATTENDANCE_REPORT: AttendanceReport = {
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    total_working_days: 23,
    average_attendance_rate: 95.2,
    total_absences: 56,
    absence_by_type: [
        { type: 'Отпуск', days: 24, percentage: 42.9 },
        { type: 'Больничный', days: 15, percentage: 26.8 },
        { type: 'Командировка', days: 8, percentage: 14.3 },
        { type: 'Отсутствие без причины', days: 5, percentage: 8.9 },
        { type: 'Отпуск без сохранения з/п', days: 4, percentage: 7.1 }
    ],
    attendance_by_department: [
        { department_id: 1, department_name: 'Руководство', attendance_rate: 98.5, total_absences: 1 },
        { department_id: 2, department_name: 'Производственный отдел', attendance_rate: 94.1, total_absences: 18 },
        { department_id: 3, department_name: 'Отдел контроля качества', attendance_rate: 96.0, total_absences: 5 },
        { department_id: 4, department_name: 'Отдел логистики', attendance_rate: 93.8, total_absences: 9 },
        { department_id: 5, department_name: 'Финансовый отдел', attendance_rate: 97.2, total_absences: 3 },
        { department_id: 6, department_name: 'IT-отдел', attendance_rate: 95.5, total_absences: 6 },
        { department_id: 7, department_name: 'Отдел кадров', attendance_rate: 96.8, total_absences: 3 },
        { department_id: 8, department_name: 'Юридический отдел', attendance_rate: 94.5, total_absences: 4 }
    ]
};

// Мок-данные: отчёт по зарплатам
const MOCK_SALARY_REPORT: SalaryReport = {
    period_month: 1,
    period_year: 2025,
    total_payroll: 3211000000,
    average_salary: 13000000,
    median_salary: 11500000,
    min_salary: 4500000,
    max_salary: 45000000,
    salary_by_department: [
        { department_id: 1, department_name: 'Руководство', total_payroll: 180000000, average_salary: 36000000, headcount: 5 },
        { department_id: 2, department_name: 'Производственный отдел', total_payroll: 858000000, average_salary: 11000000, headcount: 78 },
        { department_id: 3, department_name: 'Отдел контроля качества', total_payroll: 312000000, average_salary: 13000000, headcount: 24 },
        { department_id: 4, department_name: 'Отдел логистики', total_payroll: 384000000, average_salary: 12000000, headcount: 32 },
        { department_id: 5, department_name: 'Финансовый отдел', total_payroll: 270000000, average_salary: 15000000, headcount: 18 },
        { department_id: 6, department_name: 'IT-отдел', total_payroll: 374000000, average_salary: 17000000, headcount: 22 },
        { department_id: 7, department_name: 'Отдел кадров', total_payroll: 195000000, average_salary: 13000000, headcount: 15 },
        { department_id: 8, department_name: 'Юридический отдел', total_payroll: 192000000, average_salary: 16000000, headcount: 12 }
    ],
    salary_by_position: [
        { position_id: 1, position_name: 'Генеральный директор', average_salary: 45000000, min_salary: 45000000, max_salary: 45000000, headcount: 1 },
        { position_id: 2, position_name: 'Начальник отдела', average_salary: 25000000, min_salary: 20000000, max_salary: 30000000, headcount: 8 },
        { position_id: 3, position_name: 'Инженер', average_salary: 14000000, min_salary: 10000000, max_salary: 18000000, headcount: 45 },
        { position_id: 4, position_name: 'Оператор', average_salary: 8500000, min_salary: 4500000, max_salary: 12000000, headcount: 62 },
        { position_id: 5, position_name: 'Специалист', average_salary: 12000000, min_salary: 8000000, max_salary: 16000000, headcount: 38 },
        { position_id: 6, position_name: 'Технолог', average_salary: 13000000, min_salary: 10000000, max_salary: 16000000, headcount: 22 },
        { position_id: 7, position_name: 'Бухгалтер', average_salary: 12500000, min_salary: 9000000, max_salary: 18000000, headcount: 12 },
        { position_id: 8, position_name: 'Менеджер', average_salary: 14500000, min_salary: 10000000, max_salary: 20000000, headcount: 18 },
        { position_id: 9, position_name: 'Юрист', average_salary: 16000000, min_salary: 12000000, max_salary: 22000000, headcount: 8 },
        { position_id: 10, position_name: 'Системный администратор', average_salary: 15000000, min_salary: 11000000, max_salary: 20000000, headcount: 6 }
    ],
    salary_distribution: [
        { salary_range: '4.5-7 млн', count: 28, percentage: 11.3 },
        { salary_range: '7-10 млн', count: 52, percentage: 21.1 },
        { salary_range: '10-15 млн', count: 88, percentage: 35.6 },
        { salary_range: '15-20 млн', count: 45, percentage: 18.2 },
        { salary_range: '20-30 млн', count: 24, percentage: 9.7 },
        { salary_range: '30+ млн', count: 10, percentage: 4.1 }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService extends ApiService {
    getDashboard(): Observable<HRAnalyticsDashboard> {
        return of(MOCK_DASHBOARD).pipe(delay(300));
    }

    getTurnoverReport(filter?: Partial<ReportFilter>): Observable<TurnoverReport> {
        return of(MOCK_TURNOVER_REPORT).pipe(delay(300));
    }

    getAttendanceReport(filter?: Partial<ReportFilter>): Observable<AttendanceReport> {
        return of(MOCK_ATTENDANCE_REPORT).pipe(delay(300));
    }

    getSalaryReport(filter?: Partial<ReportFilter>): Observable<SalaryReport> {
        return of(MOCK_SALARY_REPORT).pipe(delay(300));
    }

    exportReport(filter: ReportFilter): Observable<Blob> {
        return of(new Blob()).pipe(delay(300));
    }
}
