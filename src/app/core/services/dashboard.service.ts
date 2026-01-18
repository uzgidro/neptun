import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { ReservoirResponse } from '@/core/interfaces/reservoir';
import { Organization } from '@/core/interfaces/organizations';
import { HttpParams } from '@angular/common/http';
import { DashboardResponse } from '@/core/interfaces/ges-production';

export interface ProductionStatsResponse {
    current: {
        date: string;
        value: number;
    };
    month_total: number;
    year_total: number;
}

const DASHBOARD = '/dashboard';
const RESERVOIR = '/reservoir';
const CASCADES = '/cascades';
const PRODUCTION = '/production';
const PRODUCTION_STATS = '/production-stats';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends ApiService {
    getReservoirs(date?: Date): Observable<ReservoirResponse> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<ReservoirResponse>(BASE_URL + DASHBOARD + RESERVOIR, { params: params });
    }

    getOrganizationsCascades(): Observable<Organization[]> {
        return this.http.get<Organization[]>(BASE_URL + DASHBOARD + CASCADES);
    }

    getGESProduction(): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(BASE_URL + DASHBOARD + PRODUCTION);
    }

    getProductionStats(): Observable<ProductionStatsResponse> {
        return this.http.get<ProductionStatsResponse>(BASE_URL + DASHBOARD + PRODUCTION_STATS);
    }
}
