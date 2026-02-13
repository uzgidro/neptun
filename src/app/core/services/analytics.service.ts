import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HRAnalyticsDashboard, TurnoverReport, AttendanceReport, SalaryReport, AnalyticsFilter } from '@/core/interfaces/hrm/analytics';

const ANALYTICS = '/hrm/analytics';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService extends ApiService {
    getDashboard(): Observable<HRAnalyticsDashboard> {
        return this.http.get<HRAnalyticsDashboard>(BASE_URL + ANALYTICS + '/dashboard');
    }

    getTurnoverReport(filter?: AnalyticsFilter): Observable<TurnoverReport> {
        return this.http.post<TurnoverReport>(BASE_URL + ANALYTICS + '/turnover', filter || {});
    }

    getAttendanceReport(filter?: AnalyticsFilter): Observable<AttendanceReport> {
        return this.http.post<AttendanceReport>(BASE_URL + ANALYTICS + '/attendance', filter || {});
    }

    getSalaryReport(filter?: AnalyticsFilter): Observable<SalaryReport> {
        return this.http.post<SalaryReport>(BASE_URL + ANALYTICS + '/salary', filter || {});
    }

    exportReport(reportType: string, format: 'xlsx' | 'pdf' | 'csv'): Observable<Blob> {
        return this.http.get(BASE_URL + ANALYTICS + '/export/' + reportType, {
            params: { format },
            responseType: 'blob'
        });
    }
}
