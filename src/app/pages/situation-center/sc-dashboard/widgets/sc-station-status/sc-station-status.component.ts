import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Subscription, interval } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '@/core/services/dashboard.service';
import { Organization } from '@/core/interfaces/organizations';

interface StatusItem {
    labelKey: string;
    value: number;
    color: string;
    cssClass: string;
}

@Component({
    selector: 'sc-station-status',
    standalone: true,
    imports: [ChartModule, DecimalPipe, TranslateModule],
    templateUrl: './sc-station-status.component.html',
    styleUrl: './sc-station-status.component.scss'
})
export class ScStationStatusComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private translateService = inject(TranslateService);
    private refreshSubscription?: Subscription;

    statusData: StatusItem[] = [
        { labelKey: 'SITUATION_CENTER.DASHBOARD.STATION_STATUS.STATUS_WORKING', value: 0, color: '#ef4444', cssClass: 'status-active' },
        { labelKey: 'SITUATION_CENTER.DASHBOARD.STATION_STATUS.STATUS_IDLE', value: 0, color: '#22c55e', cssClass: 'status-stopped' },
        { labelKey: 'SITUATION_CENTER.DASHBOARD.STATION_STATUS.STATUS_REPAIR', value: 0, color: '#f59e0b', cssClass: 'status-repair' }
    ];

    totalUnits = 0;
    totalPower = 0;
    loading = true;
    lastUpdated: Date | null = null;

    chartData: any;
    chartOptions: any;

    ngOnInit(): void {
        this.initChartOptions();
        this.loadData();
        // Refresh every 2 minutes
        this.refreshSubscription = interval(120000).subscribe(() => this.loadData());
    }

    private loadData(): void {
        this.loading = true;
        this.dashboardService.getOrganizationsCascades().subscribe({
            next: (cascades: Organization[]) => {
                this.calculateAggregates(cascades);
                this.updateChart();
                this.lastUpdated = new Date();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading cascades:', err);
                this.loading = false;
            }
        });
    }

    refresh(): void {
        this.loadData();
    }

    getTimeAgo(): string {
        if (!this.lastUpdated) return '';
        const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
        if (seconds < 60) return this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.JUST_NOW');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.MINUTES_AGO', { count: minutes });
        const hours = Math.floor(minutes / 60);
        return this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.HOURS_AGO', { count: hours });
    }

    private calculateAggregates(cascades: Organization[]): void {
        let active = 0;
        let pending = 0;
        let repair = 0;
        let power = 0;

        // Берём только детей (items), не родителей - чтобы избежать двойного подсчёта
        cascades.forEach((cascade) => {
            if (cascade.items && cascade.items.length > 0) {
                cascade.items.forEach((child) => {
                    if (child.ascue_metrics) {
                        active += child.ascue_metrics.active_agg_count || 0;
                        pending += child.ascue_metrics.pending_agg_count || 0;
                        repair += child.ascue_metrics.repair_agg_count || 0;
                        power += child.ascue_metrics.active || 0;
                    }
                });
            }
        });

        this.statusData = [
            { labelKey: 'SITUATION_CENTER.DASHBOARD.STATION_STATUS.STATUS_WORKING', value: active, color: '#ff4757', cssClass: 'status-active' },
            { labelKey: 'SITUATION_CENTER.DASHBOARD.STATION_STATUS.STATUS_IDLE', value: pending, color: '#00ff88', cssClass: 'status-stopped' },
            { labelKey: 'SITUATION_CENTER.DASHBOARD.STATION_STATUS.STATUS_REPAIR', value: repair, color: '#ffd32a', cssClass: 'status-repair' }
        ];

        this.totalUnits = active + pending + repair;
        this.totalPower = power;
    }

    private initChartOptions(): void {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            animation: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        };
    }

    private updateChart(): void {
        this.chartData = {
            labels: this.statusData.map((s) => this.translateService.instant(s.labelKey)),
            datasets: [
                {
                    data: this.statusData.map((s) => s.value),
                    backgroundColor: this.statusData.map((s) => s.color),
                    borderWidth: 0,
                    hoverOffset: 8
                }
            ]
        };
    }

    getPercentage(value: number): number {
        return this.totalUnits > 0 ? Math.round((value / this.totalUnits) * 100) : 0;
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }
}
