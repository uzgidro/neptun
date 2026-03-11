import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@/core/services/config.service';
import { HRAnalyticsDashboard, AnalyticsFilter } from '@/core/interfaces/hrm/analytics';

@Injectable({
    providedIn: 'root'
})
export class HRAnalyticsService {
    private http = inject(HttpClient);
    private configService = inject(ConfigService);

    private get API_URL(): string {
        return this.configService.apiBaseUrl + '/hrm/analytics';
    }

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
        return this.http.get<HRAnalyticsDashboard>(`${this.API_URL}/dashboard`, { params: this.buildParams(filter) });
    }
}
