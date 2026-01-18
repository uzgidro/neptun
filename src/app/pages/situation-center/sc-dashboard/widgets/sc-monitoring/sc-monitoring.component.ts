import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '@/core/services/dashboard.service';
import { Reservoir } from '@/core/interfaces/reservoir';

@Component({
    selector: 'sc-monitoring',
    standalone: true,
    imports: [DecimalPipe, TranslateModule],
    templateUrl: './sc-monitoring.component.html',
    styleUrl: './sc-monitoring.component.scss'
})
export class ScMonitoringComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private translateService = inject(TranslateService);
    private refreshSubscription?: Subscription;

    reservoirs: Reservoir[] = [];
    loading = true;
    lastUpdated: Date | null = null;

    ngOnInit(): void {
        this.loadData();
        this.refreshSubscription = interval(3600000).subscribe(() => this.loadData()); // 1 час
    }

    private loadData(): void {
        this.loading = true;
        this.dashboardService.getReservoirs().subscribe({
            next: (data: Reservoir[]) => {
                console.log(data);
                this.reservoirs = data;
                this.lastUpdated = new Date();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading reservoirs:', err);
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

    get totalVolume(): number {
        return this.reservoirs.reduce((sum, r) => sum + (r.reservoir_metrics?.current?.volume || 0), 0);
    }

    get totalIncome(): number {
        return this.reservoirs.reduce((sum, r) => sum + (r.reservoir_metrics?.current?.income || 0), 0);
    }

    get reservoirCount(): number {
        return this.reservoirs.length;
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }
}
