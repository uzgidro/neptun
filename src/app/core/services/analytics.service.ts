import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { HRAnalyticsDashboard, TurnoverReport, AttendanceReport, SalaryReport, AnalyticsFilter } from '@/core/interfaces/hrm/analytics';

const ANALYTICS = '/hrm/analytics';
const USE_MOCK = !BASE_URL;

const MOCK_DASHBOARD: HRAnalyticsDashboard = {
    total_employees: 3842,
    new_hires_month: 47,
    terminations_month: 12,
    turnover_rate: 3.1,
    avg_tenure_years: 8.4,
    avg_age: 41,
    gender_distribution: { male: 2690, female: 1152, total: 3842 },
    age_distribution: [
        { label: '18-25', count: 346, percentage: 9.0 },
        { label: '26-35', count: 922, percentage: 24.0 },
        { label: '36-45', count: 1153, percentage: 30.0 },
        { label: '46-55', count: 922, percentage: 24.0 },
        { label: '56+', count: 499, percentage: 13.0 }
    ],
    tenure_distribution: [
        { label: 'До 1 года', count: 384, percentage: 10.0 },
        { label: '1-3 года', count: 691, percentage: 18.0 },
        { label: '3-5 лет', count: 768, percentage: 20.0 },
        { label: '5-10 лет', count: 922, percentage: 24.0 },
        { label: '10-20 лет', count: 768, percentage: 20.0 },
        { label: 'Более 20 лет', count: 309, percentage: 8.0 }
    ],
    department_headcount: [
        { department_id: 1, department_name: 'Чарвакская ГЭС', headcount: 412 },
        { department_id: 2, department_name: 'Ходжикентская ГЭС', headcount: 285 },
        { department_id: 3, department_name: 'Фархадская ГЭС', headcount: 378 },
        { department_id: 4, department_name: 'Тупалангская ГЭС', headcount: 264 },
        { department_id: 5, department_name: 'Кадиринская ГЭС', headcount: 198 },
        { department_id: 6, department_name: 'Ахангаранская ГЭС', headcount: 231 },
        { department_id: 7, department_name: 'Чирчик-Бозсуйский каскад ГЭС', headcount: 356 },
        { department_id: 8, department_name: 'Навоийская ТЭС', headcount: 342 },
        { department_id: 9, department_name: 'Центральный аппарат', headcount: 487 },
        { department_id: 10, department_name: 'Талимарджанская ТЭС', headcount: 315 },
        { department_id: 11, department_name: 'Сырдарьинская ТЭС', headcount: 298 },
        { department_id: 12, department_name: 'Ташкентская ТЭЦ', headcount: 276 }
    ],
    position_headcount: [
        { position_id: 1, position_name: 'Инженер-энергетик', count: 486 },
        { position_id: 2, position_name: 'Оператор турбинного оборудования', count: 312 },
        { position_id: 3, position_name: 'Электромонтёр', count: 578 },
        { position_id: 4, position_name: 'Диспетчер', count: 198 },
        { position_id: 5, position_name: 'Слесарь-ремонтник', count: 423 },
        { position_id: 6, position_name: 'Начальник смены', count: 145 },
        { position_id: 7, position_name: 'Мастер участка', count: 267 },
        { position_id: 8, position_name: 'Экономист', count: 134 },
        { position_id: 9, position_name: 'Бухгалтер', count: 112 },
        { position_id: 10, position_name: 'Специалист по охране труда', count: 89 }
    ]
};

const MOCK_TURNOVER_REPORT: TurnoverReport = {
    period_start: '2026-01-01',
    period_end: '2026-03-01',
    total_terminations: 34,
    voluntary_terminations: 22,
    involuntary_terminations: 12,
    turnover_rate: 3.1,
    retention_rate: 96.9,
    avg_tenure_at_termination: 4.2,
    by_reason: [
        { label: 'Собственное желание', count: 14, percentage: 41.2 },
        { label: 'Выход на пенсию', count: 8, percentage: 23.5 },
        { label: 'Истечение срока контракта', count: 5, percentage: 14.7 },
        { label: 'Сокращение штата', count: 4, percentage: 11.8 },
        { label: 'Нарушение трудовой дисциплины', count: 2, percentage: 5.9 },
        { label: 'Перевод в другую организацию', count: 1, percentage: 2.9 }
    ],
    by_department: [
        { department: 'Чарвакская ГЭС', terminations: 7, turnover_rate: 1.7 },
        { department: 'Ходжикентская ГЭС', terminations: 3, turnover_rate: 1.1 },
        { department: 'Фархадская ГЭС', terminations: 6, turnover_rate: 1.6 },
        { department: 'Тупалангская ГЭС', terminations: 4, turnover_rate: 1.5 },
        { department: 'Кадиринская ГЭС', terminations: 2, turnover_rate: 1.0 },
        { department: 'Центральный аппарат', terminations: 5, turnover_rate: 1.0 },
        { department: 'Навоийская ТЭС', terminations: 4, turnover_rate: 1.2 },
        { department: 'Чирчик-Бозсуйский каскад ГЭС', terminations: 3, turnover_rate: 0.8 }
    ]
};

const MOCK_ATTENDANCE_REPORT: AttendanceReport = {
    period_start: '2026-02-01',
    period_end: '2026-03-01',
    total_work_days: 20,
    avg_attendance: 94.7,
    avg_absence: 5.3,
    by_status: [
        { label: 'Присутствовал', count: 3637, percentage: 94.7 },
        { label: 'Больничный', count: 89, percentage: 2.3 },
        { label: 'Отпуск', count: 62, percentage: 1.6 },
        { label: 'Командировка', count: 31, percentage: 0.8 },
        { label: 'Без уважительной причины', count: 12, percentage: 0.3 },
        { label: 'Учебный отпуск', count: 11, percentage: 0.3 }
    ],
    by_department: [
        { department: 'Чарвакская ГЭС', attendance_rate: 95.1, absence_rate: 4.9 },
        { department: 'Ходжикентская ГЭС', attendance_rate: 96.2, absence_rate: 3.8 },
        { department: 'Фархадская ГЭС', attendance_rate: 93.8, absence_rate: 6.2 },
        { department: 'Тупалангская ГЭС', attendance_rate: 94.5, absence_rate: 5.5 },
        { department: 'Кадиринская ГЭС', attendance_rate: 95.9, absence_rate: 4.1 },
        { department: 'Ахангаранская ГЭС', attendance_rate: 94.2, absence_rate: 5.8 },
        { department: 'Чирчик-Бозсуйский каскад ГЭС', attendance_rate: 93.5, absence_rate: 6.5 },
        { department: 'Навоийская ТЭС', attendance_rate: 95.4, absence_rate: 4.6 },
        { department: 'Центральный аппарат', attendance_rate: 96.8, absence_rate: 3.2 },
        { department: 'Талимарджанская ТЭС', attendance_rate: 94.0, absence_rate: 6.0 }
    ]
};

const MOCK_SALARY_REPORT: SalaryReport = {
    period_start: '2026-02-01',
    period_end: '2026-03-01',
    total_payroll: 18470000000,
    avg_salary: 4807912,
    median_salary: 4250000,
    min_salary: 2150000,
    max_salary: 18500000,
    by_department: [
        { department: 'Чарвакская ГЭС', avg_salary: 5120000, total_payroll: 2109440000, headcount: 412 },
        { department: 'Ходжикентская ГЭС', avg_salary: 4890000, total_payroll: 1393650000, headcount: 285 },
        { department: 'Фархадская ГЭС', avg_salary: 5050000, total_payroll: 1908900000, headcount: 378 },
        { department: 'Тупалангская ГЭС', avg_salary: 4780000, total_payroll: 1261920000, headcount: 264 },
        { department: 'Кадиринская ГЭС', avg_salary: 4650000, total_payroll: 920700000, headcount: 198 },
        { department: 'Ахангаранская ГЭС', avg_salary: 4720000, total_payroll: 1090320000, headcount: 231 },
        { department: 'Чирчик-Бозсуйский каскад ГЭС', avg_salary: 4950000, total_payroll: 1762200000, headcount: 356 },
        { department: 'Навоийская ТЭС', avg_salary: 4810000, total_payroll: 1645020000, headcount: 342 },
        { department: 'Центральный аппарат', avg_salary: 5340000, total_payroll: 2600580000, headcount: 487 },
        { department: 'Талимарджанская ТЭС', avg_salary: 4760000, total_payroll: 1499400000, headcount: 315 },
        { department: 'Сырдарьинская ТЭС', avg_salary: 4690000, total_payroll: 1397620000, headcount: 298 },
        { department: 'Ташкентская ТЭЦ', avg_salary: 4580000, total_payroll: 1264080000, headcount: 276 }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService extends ApiService {
    getDashboard(): Observable<HRAnalyticsDashboard> {
        if (USE_MOCK) return of(MOCK_DASHBOARD).pipe(delay(200));
        return this.http.get<HRAnalyticsDashboard>(BASE_URL + ANALYTICS + '/dashboard');
    }

    getTurnoverReport(filter?: AnalyticsFilter): Observable<TurnoverReport> {
        if (USE_MOCK) return of(MOCK_TURNOVER_REPORT).pipe(delay(200));
        return this.http.post<TurnoverReport>(BASE_URL + ANALYTICS + '/turnover', filter || {});
    }

    getAttendanceReport(filter?: AnalyticsFilter): Observable<AttendanceReport> {
        if (USE_MOCK) return of(MOCK_ATTENDANCE_REPORT).pipe(delay(200));
        return this.http.post<AttendanceReport>(BASE_URL + ANALYTICS + '/attendance', filter || {});
    }

    getSalaryReport(filter?: AnalyticsFilter): Observable<SalaryReport> {
        if (USE_MOCK) return of(MOCK_SALARY_REPORT).pipe(delay(200));
        return this.http.post<SalaryReport>(BASE_URL + ANALYTICS + '/salary', filter || {});
    }

    exportReport(reportType: string, format: 'xlsx' | 'pdf' | 'csv'): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock'], { type: 'application/octet-stream' })).pipe(delay(200));
        return this.http.get(BASE_URL + ANALYTICS + '/export/' + reportType, {
            params: { format },
            responseType: 'blob'
        });
    }
}
