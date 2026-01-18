import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Subscription, interval } from 'rxjs';
import { DashboardService } from '@/core/services/dashboard.service';
import { Organization } from '@/core/interfaces/organizations';

interface StatusItem {
    label: string;
    value: number;
    color: string;
    cssClass: string;
}

@Component({
    selector: 'sc-station-status',
    standalone: true,
    imports: [ChartModule],
    templateUrl: './sc-station-status.component.html',
    styleUrl: './sc-station-status.component.scss'
})
export class ScStationStatusComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private refreshSubscription?: Subscription;

    statusData: StatusItem[] = [
        { label: 'В работе', value: 0, color: '#ff4757', cssClass: 'status-active' },
        { label: 'Простаивают', value: 0, color: '#00ff88', cssClass: 'status-stopped' },
        { label: 'В ремонте', value: 0, color: '#ffd32a', cssClass: 'status-repair' }
    ];

    totalUnits = 0;
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
        if (seconds < 60) return 'только что';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} мин. назад`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ч. назад`;
    }

    private calculateAggregates(cascades: Organization[]): void {
        let active = 0;
        let pending = 0;
        let repair = 0;

        const processOrg = (org: Organization) => {
            if (org.ascue_metrics) {
                active += org.ascue_metrics.active_agg_count || 0;
                pending += org.ascue_metrics.pending_agg_count || 0;
                repair += org.ascue_metrics.repair_agg_count || 0;
            }
            if (org.items && org.items.length > 0) {
                org.items.forEach(item => processOrg(item));
            }
        };

        cascades.forEach(cascade => processOrg(cascade));

        this.statusData = [
            { label: 'В работе', value: active, color: '#ff4757', cssClass: 'status-active' },
            { label: 'Простаивают', value: pending, color: '#00ff88', cssClass: 'status-stopped' },
            { label: 'В ремонте', value: repair, color: '#ffd32a', cssClass: 'status-repair' }
        ];

        this.totalUnits = active + pending + repair;
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
            labels: this.statusData.map(s => s.label),
            datasets: [
                {
                    data: this.statusData.map(s => s.value),
                    backgroundColor: this.statusData.map(s => s.color),
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
