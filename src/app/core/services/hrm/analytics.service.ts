import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import {
    HRAnalyticsDashboard, AnalyticsFilter, TrendData,
    HeadcountReport, TurnoverReport, AttendanceReport,
    SalaryReport, PerformanceReport, TrainingReport,
    DemographicsReport
} from '@/core/interfaces/hrm/analytics';

const API_URL = BASE_URL + '/hrm/analytics';
const USE_MOCK = !BASE_URL;

const MOCK_DASHBOARD: HRAnalyticsDashboard = {
    total_employees: 3842, new_hires_month: 28, terminations_month: 5, turnover_rate: 4.2, avg_tenure_years: 8.6, avg_age: 38,
    gender_distribution: { male: 2845, female: 997, total: 3842 },
    age_distribution: [
        { label: '18-25', count: 312, percentage: 8.1 }, { label: '26-35', count: 1105, percentage: 28.8 },
        { label: '36-45', count: 1280, percentage: 33.3 }, { label: '46-55', count: 842, percentage: 21.9 },
        { label: '56+', count: 303, percentage: 7.9 }
    ],
    tenure_distribution: [
        { label: '< 1 года', count: 245, percentage: 6.4 }, { label: '1-3 года', count: 620, percentage: 16.1 },
        { label: '3-5 лет', count: 785, percentage: 20.4 }, { label: '5-10 лет', count: 1105, percentage: 28.8 },
        { label: '10+ лет', count: 1087, percentage: 28.3 }
    ],
    department_headcount: [
        { department_id: 1, department_name: 'Молокозавод «Чарвак»', headcount: 485 },
        { department_id: 2, department_name: 'Молокозавод «Ходжикент»', headcount: 312 },
        { department_id: 3, department_name: 'Молокозавод «Газалкент»', headcount: 198 },
        { department_id: 4, department_name: 'Молокозавод «Фархад»', headcount: 425 },
        { department_id: 5, department_name: 'Центральный аппарат', headcount: 280 },
        { department_id: 6, department_name: 'Сырдарьинский молокозавод', headcount: 520 },
        { department_id: 7, department_name: 'Зарафшанский молокозавод', headcount: 345 }
    ],
    position_headcount: [
        { position_id: 1, position_name: 'Инженер', count: 842 }, { position_id: 2, position_name: 'Техник', count: 620 },
        { position_id: 3, position_name: 'Оператор', count: 510 }, { position_id: 4, position_name: 'Начальник смены', count: 185 },
        { position_id: 5, position_name: 'Руководитель', count: 120 }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class HRAnalyticsService {
    private http = inject(HttpClient);

    private buildParams(filter?: AnalyticsFilter): HttpParams {
        let params = new HttpParams();
        if (filter?.start_date) params = params.set('start_date', filter.start_date);
        if (filter?.end_date) params = params.set('end_date', filter.end_date);
        if (filter?.department_id) params = params.set('department_id', filter.department_id.toString());
        if (filter?.position_id) params = params.set('position_id', filter.position_id.toString());
        if (filter?.report_type) params = params.set('report_type', filter.report_type);
        return params;
    }

    getDashboard(filter?: AnalyticsFilter): Observable<HRAnalyticsDashboard> {
        if (USE_MOCK) return of(MOCK_DASHBOARD).pipe(delay(250));
        return this.http.get<HRAnalyticsDashboard>(`${API_URL}/dashboard`, { params: this.buildParams(filter) });
    }

    getHeadcountReport(filter?: AnalyticsFilter): Observable<HeadcountReport> {
        if (USE_MOCK) return of({ total_employees: 3842, by_department: MOCK_DASHBOARD.department_headcount, by_position: MOCK_DASHBOARD.position_headcount }).pipe(delay(200));
        return this.http.get<HeadcountReport>(`${API_URL}/reports/headcount`, { params: this.buildParams(filter) });
    }

    getHeadcountTrend(filter?: AnalyticsFilter): Observable<TrendData> {
        if (USE_MOCK) return of({ points: [
            { year: 2025, month: 7, value: 3780 }, { year: 2025, month: 8, value: 3795 }, { year: 2025, month: 9, value: 3800 },
            { year: 2025, month: 10, value: 3812 }, { year: 2025, month: 11, value: 3825 }, { year: 2025, month: 12, value: 3830 },
            { year: 2026, month: 1, value: 3835 }, { year: 2026, month: 2, value: 3842 }
        ] }).pipe(delay(200));
        return this.http.get<TrendData>(`${API_URL}/reports/headcount-trend`, { params: this.buildParams(filter) });
    }

    getTurnoverReport(filter?: AnalyticsFilter): Observable<TurnoverReport> {
        if (USE_MOCK) return of({
            period_start: '2025-01-01', period_end: '2025-12-31', total_terminations: 162, voluntary_terminations: 98,
            involuntary_terminations: 64, turnover_rate: 4.2, retention_rate: 95.8, avg_tenure_at_termination: 3.5,
            by_reason: [
                { label: 'По собственному желанию', count: 68, percentage: 42 }, { label: 'Сокращение', count: 32, percentage: 19.8 },
                { label: 'Выход на пенсию', count: 28, percentage: 17.3 }, { label: 'Истечение контракта', count: 22, percentage: 13.6 },
                { label: 'Прочие', count: 12, percentage: 7.4 }
            ],
            by_department: [
                { department: 'Молокозавод «Чарвак»', terminations: 22, turnover_rate: 4.5 },
                { department: 'Молокозавод «Фархад»', terminations: 18, turnover_rate: 4.2 },
                { department: 'Центральный аппарат', terminations: 12, turnover_rate: 4.3 }
            ]
        }).pipe(delay(200));
        return this.http.get<TurnoverReport>(`${API_URL}/reports/turnover`, { params: this.buildParams(filter) });
    }

    getTurnoverTrend(filter?: AnalyticsFilter): Observable<TrendData> {
        if (USE_MOCK) return of({ points: [
            { year: 2025, month: 7, value: 3.8 }, { year: 2025, month: 8, value: 4.1 }, { year: 2025, month: 9, value: 3.9 },
            { year: 2025, month: 10, value: 4.5 }, { year: 2025, month: 11, value: 4.0 }, { year: 2025, month: 12, value: 4.2 },
            { year: 2026, month: 1, value: 3.7 }, { year: 2026, month: 2, value: 4.2 }
        ] }).pipe(delay(200));
        return this.http.get<TrendData>(`${API_URL}/reports/turnover-trend`, { params: this.buildParams(filter) });
    }

    getAttendanceReport(filter?: AnalyticsFilter): Observable<AttendanceReport> {
        if (USE_MOCK) return of({
            period_start: '2026-02-01', period_end: '2026-02-28', total_work_days: 20, avg_attendance: 94.5, avg_absence: 5.5,
            by_status: [
                { label: 'Присутствовали', count: 3630, percentage: 94.5 }, { label: 'Отпуск', count: 85, percentage: 2.2 },
                { label: 'Больничный', count: 52, percentage: 1.4 }, { label: 'Командировка', count: 45, percentage: 1.2 },
                { label: 'Прочие', count: 30, percentage: 0.8 }
            ],
            by_department: [
                { department: 'Молокозавод «Чарвак»', attendance_rate: 95.2, absence_rate: 4.8 },
                { department: 'Молокозавод «Фархад»', attendance_rate: 93.8, absence_rate: 6.2 },
                { department: 'Центральный аппарат', attendance_rate: 96.1, absence_rate: 3.9 }
            ]
        }).pipe(delay(200));
        return this.http.get<AttendanceReport>(`${API_URL}/reports/attendance`, { params: this.buildParams(filter) });
    }

    getSalaryReport(filter?: AnalyticsFilter): Observable<SalaryReport> {
        if (USE_MOCK) return of({
            period_start: '2026-02-01', period_end: '2026-02-28', total_payroll: 18500000000, avg_salary: 4815000,
            median_salary: 4200000, min_salary: 2500000, max_salary: 25000000,
            by_department: [
                { department: 'Молокозавод «Чарвак»', avg_salary: 5200000, total_payroll: 2522000000, headcount: 485 },
                { department: 'Молокозавод «Фархад»', avg_salary: 4800000, total_payroll: 2040000000, headcount: 425 },
                { department: 'Центральный аппарат', avg_salary: 6100000, total_payroll: 1708000000, headcount: 280 }
            ]
        }).pipe(delay(200));
        return this.http.get<SalaryReport>(`${API_URL}/reports/salary`, { params: this.buildParams(filter) });
    }

    getSalaryTrend(filter?: AnalyticsFilter): Observable<TrendData> {
        if (USE_MOCK) return of({ points: [
            { year: 2025, month: 7, value: 4200000 }, { year: 2025, month: 8, value: 4300000 }, { year: 2025, month: 9, value: 4350000 },
            { year: 2025, month: 10, value: 4500000 }, { year: 2025, month: 11, value: 4600000 }, { year: 2025, month: 12, value: 4700000 },
            { year: 2026, month: 1, value: 4750000 }, { year: 2026, month: 2, value: 4815000 }
        ] }).pipe(delay(200));
        return this.http.get<TrendData>(`${API_URL}/reports/salary-trend`, { params: this.buildParams(filter) });
    }

    getPerformanceReport(filter?: AnalyticsFilter): Observable<PerformanceReport> {
        if (USE_MOCK) return of({
            total_reviews: 48, avg_rating: 3.8,
            rating_distribution: [
                { label: 'Исключительно (5)', count: 5, percentage: 10.4 }, { label: 'Превышает ожидания (4)', count: 18, percentage: 37.5 },
                { label: 'Соответствует (3)', count: 20, percentage: 41.7 }, { label: 'Требует улучшения (2)', count: 4, percentage: 8.3 },
                { label: 'Неудовлетворительно (1)', count: 1, percentage: 2.1 }
            ],
            goal_completion: { total: 120, completed: 72, rate: 60 },
            by_department: [
                { department: 'Молокозавод «Чарвак»', avg_rating: 4.0, goal_rate: 65 },
                { department: 'Молокозавод «Фархад»', avg_rating: 3.7, goal_rate: 58 },
                { department: 'Центральный аппарат', avg_rating: 3.9, goal_rate: 62 }
            ]
        }).pipe(delay(200));
        return this.http.get<PerformanceReport>(`${API_URL}/reports/performance`, { params: this.buildParams(filter) });
    }

    getTrainingReport(filter?: AnalyticsFilter): Observable<TrainingReport> {
        if (USE_MOCK) return of({
            total_trainings: 24, total_participants: 380, completion_rate: 78,
            by_status: [
                { label: 'Завершено', count: 15, percentage: 62.5 }, { label: 'В процессе', count: 5, percentage: 20.8 },
                { label: 'Запланировано', count: 4, percentage: 16.7 }
            ],
            by_type: [
                { label: 'Курс', count: 10, percentage: 41.7 }, { label: 'Семинар', count: 6, percentage: 25 },
                { label: 'Сертификация', count: 4, percentage: 16.7 }, { label: 'Воркшоп', count: 4, percentage: 16.7 }
            ]
        }).pipe(delay(200));
        return this.http.get<TrainingReport>(`${API_URL}/reports/training`, { params: this.buildParams(filter) });
    }

    getDemographicsReport(filter?: AnalyticsFilter): Observable<DemographicsReport> {
        if (USE_MOCK) return of({ total_employees: 3842, avg_age: 38, age_distribution: MOCK_DASHBOARD.age_distribution, tenure_distribution: MOCK_DASHBOARD.tenure_distribution }).pipe(delay(200));
        return this.http.get<DemographicsReport>(`${API_URL}/reports/demographics`, { params: this.buildParams(filter) });
    }

    getDiversityReport(filter?: AnalyticsFilter): Observable<any> {
        if (USE_MOCK) return of({ gender: MOCK_DASHBOARD.gender_distribution, age: MOCK_DASHBOARD.age_distribution }).pipe(delay(200));
        return this.http.get<any>(`${API_URL}/reports/diversity`, { params: this.buildParams(filter) });
    }

    getCustomReport(filter: AnalyticsFilter): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.get<any>(`${API_URL}/reports/custom`, { params: this.buildParams(filter) });
    }

    exportReport(filter: AnalyticsFilter): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.get<any>(`${API_URL}/export`, { params: this.buildParams(filter) });
    }

    exportToExcel(filter: AnalyticsFilter): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock'], { type: 'application/vnd.ms-excel' })).pipe(delay(200));
        return this.http.get(`${API_URL}/export/excel`, { params: this.buildParams(filter), responseType: 'blob' });
    }
}
