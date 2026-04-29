import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import {
    SolarConfig, SolarConfigPayload,
    SolarDailyData, SolarDailyDataPayload,
    SolarPlan, SolarPlanPayload
} from '@/core/interfaces/solar-report';

const SOLAR = '/solar';
const CONFIG = '/config';
const DAILY_DATA = '/daily-data';
const PLANS = '/plans';

@Injectable({ providedIn: 'root' })
export class SolarReportService extends ApiService {

    upsertConfig(payload: SolarConfigPayload): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${SOLAR}${CONFIG}`, payload);
    }

    getConfigs(): Observable<SolarConfig[]> {
        return this.http.get<SolarConfig[]>(`${this.BASE_URL}${SOLAR}${CONFIG}`);
    }

    deleteConfig(organizationId: number): Observable<void> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.delete<void>(`${this.BASE_URL}${SOLAR}${CONFIG}`, { params });
    }

    upsertDailyData(payload: SolarDailyDataPayload[]): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${SOLAR}${DAILY_DATA}`, payload);
    }

    getDailyData(date: string, organizationId?: number): Observable<SolarDailyData[]> {
        let params = new HttpParams().set('date', date);
        if (organizationId !== undefined && organizationId !== null) {
            params = params.set('organization_id', organizationId);
        }
        return this.http.get<SolarDailyData[]>(`${this.BASE_URL}${SOLAR}${DAILY_DATA}`, { params });
    }

    bulkUpsertPlans(plans: SolarPlanPayload[]): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${SOLAR}${PLANS}`, { plans });
    }

    getPlans(year: number): Observable<SolarPlan[]> {
        const params = new HttpParams().set('year', year);
        return this.http.get<SolarPlan[]>(`${this.BASE_URL}${SOLAR}${PLANS}`, { params });
    }
}
