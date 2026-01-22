import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
        return this.http.get<Organization[]>(BASE_URL + DASHBOARD + CASCADES).pipe(
            map(cascades => this.normalizeCascades(cascades))
        );
    }

    /**
     * Нормализация данных каскадов:
     * - Обнуление отрицательных значений pending/repair у детей
     * - Пересчёт агрегатов родителя на основе детей
     */
    private normalizeCascades(cascades: Organization[]): Organization[] {
        return cascades.map(cascade => this.normalizeOrganization(cascade));
    }

    private normalizeOrganization(org: Organization): Organization {
        // Если есть дочерние элементы - обрабатываем их
        if (org.items && org.items.length > 0) {
            // Нормализуем детей
            org.items = org.items.map(child => {
                if (child.ascue_metrics) {
                    // Обнуляем отрицательные значения
                    if (child.ascue_metrics.pending_agg_count < 0) {
                        child.ascue_metrics.pending_agg_count = 0;
                        child.ascue_metrics.repair_agg_count = 0;
                    }
                }
                return child;
            });

            // Пересчитываем агрегаты родителя на основе детей
            if (org.ascue_metrics) {
                let totalActive = 0;
                let totalPending = 0;
                let totalRepair = 0;

                org.items.forEach(child => {
                    if (child.ascue_metrics) {
                        totalActive += child.ascue_metrics.active_agg_count || 0;
                        totalPending += child.ascue_metrics.pending_agg_count || 0;
                        totalRepair += child.ascue_metrics.repair_agg_count || 0;
                    }
                });

                org.ascue_metrics.active_agg_count = totalActive;
                org.ascue_metrics.pending_agg_count = totalPending;
                org.ascue_metrics.repair_agg_count = totalRepair;
            }
        }

        return org;
    }

    getGESProduction(): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(BASE_URL + DASHBOARD + PRODUCTION);
    }

    getProductionStats(): Observable<ProductionStatsResponse> {
        return this.http.get<ProductionStatsResponse>(BASE_URL + DASHBOARD + PRODUCTION_STATS);
    }
}
