import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import {
    HRAnalyticsDashboard, AnalyticsFilter, TrendData,
    HeadcountReport, TurnoverReport, AttendanceReport,
    SalaryReport, PerformanceReport, TrainingReport,
    DemographicsReport
} from '@/core/interfaces/hrm/analytics';

const API_URL = BASE_URL + '/hrm/analytics';

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

    // Dashboard
    getDashboard(filter?: AnalyticsFilter): Observable<HRAnalyticsDashboard> {
        return this.http.get<HRAnalyticsDashboard>(`${API_URL}/dashboard`, { params: this.buildParams(filter) });
    }

    // Headcount
    getHeadcountReport(filter?: AnalyticsFilter): Observable<HeadcountReport> {
        return this.http.get<HeadcountReport>(`${API_URL}/reports/headcount`, { params: this.buildParams(filter) });
    }

    getHeadcountTrend(filter?: AnalyticsFilter): Observable<TrendData> {
        return this.http.get<TrendData>(`${API_URL}/reports/headcount-trend`, { params: this.buildParams(filter) });
    }

    // Turnover
    getTurnoverReport(filter?: AnalyticsFilter): Observable<TurnoverReport> {
        return this.http.get<TurnoverReport>(`${API_URL}/reports/turnover`, { params: this.buildParams(filter) });
    }

    getTurnoverTrend(filter?: AnalyticsFilter): Observable<TrendData> {
        return this.http.get<TrendData>(`${API_URL}/reports/turnover-trend`, { params: this.buildParams(filter) });
    }

    // Attendance
    getAttendanceReport(filter?: AnalyticsFilter): Observable<AttendanceReport> {
        return this.http.get<AttendanceReport>(`${API_URL}/reports/attendance`, { params: this.buildParams(filter) });
    }

    // Salary
    getSalaryReport(filter?: AnalyticsFilter): Observable<SalaryReport> {
        return this.http.get<SalaryReport>(`${API_URL}/reports/salary`, { params: this.buildParams(filter) });
    }

    getSalaryTrend(filter?: AnalyticsFilter): Observable<TrendData> {
        return this.http.get<TrendData>(`${API_URL}/reports/salary-trend`, { params: this.buildParams(filter) });
    }

    // Performance
    getPerformanceReport(filter?: AnalyticsFilter): Observable<PerformanceReport> {
        return this.http.get<PerformanceReport>(`${API_URL}/reports/performance`, { params: this.buildParams(filter) });
    }

    // Training
    getTrainingReport(filter?: AnalyticsFilter): Observable<TrainingReport> {
        return this.http.get<TrainingReport>(`${API_URL}/reports/training`, { params: this.buildParams(filter) });
    }

    // Demographics
    getDemographicsReport(filter?: AnalyticsFilter): Observable<DemographicsReport> {
        return this.http.get<DemographicsReport>(`${API_URL}/reports/demographics`, { params: this.buildParams(filter) });
    }

    // Diversity
    getDiversityReport(filter?: AnalyticsFilter): Observable<any> {
        return this.http.get<any>(`${API_URL}/reports/diversity`, { params: this.buildParams(filter) });
    }

    // Custom
    getCustomReport(filter: AnalyticsFilter): Observable<any> {
        return this.http.get<any>(`${API_URL}/reports/custom`, { params: this.buildParams(filter) });
    }

    // Export
    exportReport(filter: AnalyticsFilter): Observable<any> {
        return this.http.get<any>(`${API_URL}/export`, { params: this.buildParams(filter) });
    }

    exportToExcel(filter: AnalyticsFilter): Observable<Blob> {
        return this.http.get(`${API_URL}/export/excel`, { params: this.buildParams(filter), responseType: 'blob' });
    }
}
