import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import {
    GesConfigPayload, GesConfigResponse,
    GesCascadeConfig, GesCascadeConfigPayload,
    GesDailyData, GesDailyDataPayload,
    GesProductionPlan, GesProductionPlanPayload,
    GesDailyReport
} from '@/core/interfaces/ges-report';
import {
    FrozenDefault, UpsertFrozenDefaultRequest, DeleteFrozenDefaultRequest
} from '@/core/interfaces/ges-frozen-defaults';

const GES_REPORT = '/ges-report';
const CONFIG = '/config';
const DAILY_DATA = '/daily-data';
const PLANS = '/plans';
const CASCADE_CONFIG = '/cascade-config';
const FROZEN_DEFAULTS = '/frozen-defaults';

@Injectable({ providedIn: 'root' })
export class GesReportService extends ApiService {

    upsertConfig(payload: GesConfigPayload): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${GES_REPORT}${CONFIG}`, payload);
    }

    getConfigs(): Observable<GesConfigResponse[]> {
        return this.http.get<GesConfigResponse[]>(`${this.BASE_URL}${GES_REPORT}${CONFIG}`);
    }

    deleteConfig(organizationId: number): Observable<void> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.delete<void>(`${this.BASE_URL}${GES_REPORT}${CONFIG}`, { params });
    }

    getCascadeConfigs(): Observable<GesCascadeConfig[]> {
        return this.http.get<GesCascadeConfig[]>(`${this.BASE_URL}${GES_REPORT}${CASCADE_CONFIG}`);
    }

    upsertCascadeConfig(payload: GesCascadeConfigPayload): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${GES_REPORT}${CASCADE_CONFIG}`, payload);
    }

    deleteCascadeConfig(organizationId: number): Observable<void> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.delete<void>(`${this.BASE_URL}${GES_REPORT}${CASCADE_CONFIG}`, { params });
    }

    upsertDailyData(payload: GesDailyDataPayload[]): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${GES_REPORT}${DAILY_DATA}`, payload);
    }

    getDailyData(organizationId: number, date: string): Observable<GesDailyData | null> {
        const params = new HttpParams().set('organization_id', organizationId).set('date', date);
        return this.http.get<GesDailyData>(`${this.BASE_URL}${GES_REPORT}${DAILY_DATA}`, { params });
    }

    bulkUpsertPlans(plans: GesProductionPlanPayload[]): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${GES_REPORT}${PLANS}`, { plans });
    }

    getPlans(year: number): Observable<GesProductionPlan[]> {
        const params = new HttpParams().set('year', year);
        return this.http.get<GesProductionPlan[]>(`${this.BASE_URL}${GES_REPORT}${PLANS}`, { params });
    }

    getReport(date: string): Observable<GesDailyReport> {
        const params = new HttpParams().set('date', date);
        return this.http.get<GesDailyReport>(`${this.BASE_URL}${GES_REPORT}`, { params });
    }

    exportReport(opts: {
        date: string;
        format: 'excel' | 'pdf';
    }): Observable<HttpResponse<Blob>> {
        const params = new HttpParams()
            .set('date', opts.date)
            .set('format', opts.format);
        return this.http.get(`${this.BASE_URL}${GES_REPORT}/export`, {
            params, responseType: 'blob', observe: 'response'
        });
    }

    listFrozenDefaults(): Observable<FrozenDefault[]> {
        return this.http.get<FrozenDefault[]>(`${this.BASE_URL}${GES_REPORT}${FROZEN_DEFAULTS}`);
    }

    upsertFrozenDefault(payload: UpsertFrozenDefaultRequest): Observable<{ status: string }> {
        return this.http.put<{ status: string }>(
            `${this.BASE_URL}${GES_REPORT}${FROZEN_DEFAULTS}`, payload
        );
    }

    deleteFrozenDefault(payload: DeleteFrozenDefaultRequest): Observable<{ status: string } | null> {
        return this.http.request<{ status: string } | null>(
            'DELETE', `${this.BASE_URL}${GES_REPORT}${FROZEN_DEFAULTS}`, { body: payload }
        );
    }
}
