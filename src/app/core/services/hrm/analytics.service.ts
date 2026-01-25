import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { HRAnalyticsDashboard, TurnoverReport, AttendanceReport, SalaryReport, ReportFilter } from '@/core/interfaces/hrm/analytics';

const API_URL = BASE_URL + '/hrm/analytics';

@Injectable({
    providedIn: 'root'
})
export class HRAnalyticsService {
    private http = inject(HttpClient);

    // Dashboard
    getDashboard(): Observable<HRAnalyticsDashboard> {
        return this.http.get<HRAnalyticsDashboard>(`${API_URL}/dashboard`);
    }

    // Headcount Reports
    getHeadcountReport(params?: { department_id?: number; date?: string }): Observable<any> {
        let httpParams = new HttpParams();
        if (params?.department_id) {
            httpParams = httpParams.set('department_id', params.department_id.toString());
        }
        if (params?.date) {
            httpParams = httpParams.set('date', params.date);
        }
        return this.http.get<any>(`${API_URL}/reports/headcount`, { params: httpParams });
    }

    getHeadcountTrend(months: number = 12): Observable<any> {
        const params = new HttpParams().set('months', months.toString());
        return this.http.get<any>(`${API_URL}/reports/headcount-trend`, { params });
    }

    // Turnover Reports
    getTurnoverReport(startDate: string, endDate: string, departmentId?: number): Observable<TurnoverReport> {
        let params = new HttpParams()
            .set('start_date', startDate)
            .set('end_date', endDate);
        if (departmentId) {
            params = params.set('department_id', departmentId.toString());
        }
        return this.http.get<TurnoverReport>(`${API_URL}/reports/turnover`, { params });
    }

    getTurnoverTrend(months: number = 12): Observable<any> {
        const params = new HttpParams().set('months', months.toString());
        return this.http.get<any>(`${API_URL}/reports/turnover-trend`, { params });
    }

    // Attendance Reports
    getAttendanceReport(startDate: string, endDate: string, departmentId?: number): Observable<AttendanceReport> {
        let params = new HttpParams()
            .set('start_date', startDate)
            .set('end_date', endDate);
        if (departmentId) {
            params = params.set('department_id', departmentId.toString());
        }
        return this.http.get<AttendanceReport>(`${API_URL}/reports/attendance`, { params });
    }

    // Salary Reports
    getSalaryReport(month: number, year: number, departmentId?: number): Observable<SalaryReport> {
        let params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        if (departmentId) {
            params = params.set('department_id', departmentId.toString());
        }
        return this.http.get<SalaryReport>(`${API_URL}/reports/salary`, { params });
    }

    getSalaryTrend(months: number = 12): Observable<any> {
        const params = new HttpParams().set('months', months.toString());
        return this.http.get<any>(`${API_URL}/reports/salary-trend`, { params });
    }

    // Performance Reports
    getPerformanceReport(year: number, departmentId?: number): Observable<any> {
        let params = new HttpParams().set('year', year.toString());
        if (departmentId) {
            params = params.set('department_id', departmentId.toString());
        }
        return this.http.get<any>(`${API_URL}/reports/performance`, { params });
    }

    // Training Reports
    getTrainingReport(startDate: string, endDate: string): Observable<any> {
        const params = new HttpParams()
            .set('start_date', startDate)
            .set('end_date', endDate);
        return this.http.get<any>(`${API_URL}/reports/training`, { params });
    }

    // Export
    exportReport(filter: ReportFilter): Observable<Blob> {
        return this.http.post(`${API_URL}/export`, filter, { responseType: 'blob' });
    }

    exportToPdf(filter: ReportFilter): Observable<Blob> {
        return this.http.post(`${API_URL}/export/pdf`, filter, { responseType: 'blob' });
    }

    exportToExcel(filter: ReportFilter): Observable<Blob> {
        return this.http.post(`${API_URL}/export/excel`, filter, { responseType: 'blob' });
    }

    // Demographics
    getDemographicsReport(): Observable<any> {
        return this.http.get<any>(`${API_URL}/reports/demographics`);
    }

    // Diversity
    getDiversityReport(): Observable<any> {
        return this.http.get<any>(`${API_URL}/reports/diversity`);
    }

    // Custom Reports
    generateCustomReport(config: any): Observable<any> {
        return this.http.post<any>(`${API_URL}/reports/custom`, config);
    }
}
