import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReservoirResponse } from '@/core/interfaces/reservoir';
import { Organization } from '@/core/interfaces/organizations';
import { DashboardResponse } from '@/core/interfaces/ges-production';

export interface ProductionStatsResponse {
    current: {
        date: string;
        value: number;
    };
    month_total: number;
    year_total: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends ApiService {
    // Mock data for storage tanks (бывшие водохранилища -> резервуары хранения)
    getReservoirs(date?: Date): Observable<ReservoirResponse> {
        const mockData: ReservoirResponse = [
            {
                organization_id: 1,
                organization_name: 'Резервуар хранения №1',
                contacts: [{ id: 1, name: 'Иванов И.И.', phone: '+998901234567' }],
                current_discharge: 0,
                reservoir_metrics: {
                    current: { income: 850, release: 720, level: 85, volume: 2500 },
                    diff: { income: 50, release: -30, level: 2, volume: 150 }
                }
            },
            {
                organization_id: 2,
                organization_name: 'Резервуар хранения №2',
                contacts: [{ id: 2, name: 'Петров П.П.', phone: '+998901234568' }],
                current_discharge: 0,
                reservoir_metrics: {
                    current: { income: 620, release: 580, level: 78, volume: 1800 },
                    diff: { income: 30, release: -20, level: 1, volume: 80 }
                }
            },
            {
                organization_id: 3,
                organization_name: 'Резервуар хранения №3',
                contacts: [{ id: 3, name: 'Сидоров С.С.', phone: '+998901234569' }],
                current_discharge: 0,
                reservoir_metrics: {
                    current: { income: 450, release: 420, level: 92, volume: 1200 },
                    diff: { income: 20, release: -10, level: 3, volume: 50 }
                }
            }
        ];
        return of(mockData).pipe(delay(200));
    }

    // Mock data for dairy plant clusters (бывшие каскады -> производственные кластеры)
    getOrganizationsCascades(): Observable<Organization[]> {
        const mockData: Organization[] = [
            {
                id: 1,
                name: 'Производственный кластер "Центр"',
                contacts: [{ id: 1, name: 'Директор Алиев А.А.', phone: '+998901111111' }],
                current_discharge: 0,
                ascue_metrics: {
                    active: 15200,
                    reactive: 3200,
                    active_agg_count: 8,
                    pending_agg_count: 1,
                    repair_agg_count: 1
                },
                items: [
                    {
                        id: 11,
                        name: 'Молокозавод №1',
                        contacts: [{ id: 11, name: 'Начальник Каримов К.К.', phone: '+998902222222' }],
                        ascue_metrics: { active: 8500, reactive: 1800, active_agg_count: 4, pending_agg_count: 0, repair_agg_count: 1 }
                    },
                    {
                        id: 12,
                        name: 'Молокозавод №2',
                        contacts: [{ id: 12, name: 'Начальник Рахимов Р.Р.', phone: '+998903333333' }],
                        ascue_metrics: { active: 6700, reactive: 1400, active_agg_count: 4, pending_agg_count: 1, repair_agg_count: 0 }
                    }
                ]
            },
            {
                id: 2,
                name: 'Производственный кластер "Восток"',
                contacts: [{ id: 2, name: 'Директор Юсупов Ю.Ю.', phone: '+998904444444' }],
                current_discharge: 0,
                ascue_metrics: {
                    active: 12800,
                    reactive: 2700,
                    active_agg_count: 6,
                    pending_agg_count: 0,
                    repair_agg_count: 0
                },
                items: [
                    {
                        id: 21,
                        name: 'Молокозавод №3',
                        contacts: [{ id: 21, name: 'Начальник Азимов А.А.', phone: '+998905555555' }],
                        ascue_metrics: { active: 7200, reactive: 1500, active_agg_count: 3, pending_agg_count: 0, repair_agg_count: 0 }
                    },
                    {
                        id: 22,
                        name: 'Молокозавод №4',
                        contacts: [{ id: 22, name: 'Начальник Бобоев Б.Б.', phone: '+998906666666' }],
                        ascue_metrics: { active: 5600, reactive: 1200, active_agg_count: 3, pending_agg_count: 0, repair_agg_count: 0 }
                    }
                ]
            }
        ];
        return of(mockData).pipe(
            delay(200),
            map((cascades) => this.normalizeCascades(cascades))
        );
    }

    /**
     * Нормализация данных кластеров
     */
    private normalizeCascades(cascades: Organization[]): Organization[] {
        return cascades.map((cascade) => this.normalizeOrganization(cascade));
    }

    private normalizeOrganization(org: Organization): Organization {
        if (org.items && org.items.length > 0) {
            org.items = org.items.map((child) => {
                if (child.ascue_metrics) {
                    if (child.ascue_metrics.pending_agg_count < 0) {
                        child.ascue_metrics.pending_agg_count = 0;
                        child.ascue_metrics.repair_agg_count = 0;
                    }
                }
                return child;
            });

            if (org.ascue_metrics) {
                let totalActive = 0;
                let totalPending = 0;
                let totalRepair = 0;

                org.items.forEach((child) => {
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

    // Mock data for milk production (бывшая выработка электроэнергии -> производство молока)
    getGESProduction(): Observable<DashboardResponse> {
        const today = new Date();
        return of({
            date: this.dateToYMD(today),
            value: 28500, // литров за день
            change_percent: 3.2,
            change_direction: 'up' as const
        }).pipe(delay(200));
    }

    getProductionStats(): Observable<ProductionStatsResponse> {
        const today = new Date();
        return of({
            current: {
                date: this.dateToYMD(today),
                value: 285 // литров за день
            },
            month_total: 8560, // литров за месяц
            year_total: 10000 // литров за год
        }).pipe(delay(200));
    }
}
