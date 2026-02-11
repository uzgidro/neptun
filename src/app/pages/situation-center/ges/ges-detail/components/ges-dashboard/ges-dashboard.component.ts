import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';

import { GesService } from '@/core/services/ges.service';
import { GesResponse, TelemetryEnvelope, GesKpiData, ASCUEMetrics } from '@/core/interfaces/ges';

import { GesKpiCardComponent } from '../ges-kpi-card/ges-kpi-card.component';
import { GesAggregatesComponent } from '../ges-aggregates/ges-aggregates.component';
import { GesMnemonicComponent } from '../ges-mnemonic/ges-mnemonic.component';

@Component({
    selector: 'app-ges-dashboard',
    standalone: true,
    imports: [CommonModule, TranslateModule, ButtonDirective, GesKpiCardComponent, GesAggregatesComponent, GesMnemonicComponent],
    templateUrl: './ges-dashboard.component.html',
    styleUrl: './ges-dashboard.component.scss'
})
export class GesDashboardComponent implements OnInit, OnDestroy {
    @Input() gesId!: number;
    @Input() gesInfo!: GesResponse;

    private gesService = inject(GesService);
    private translate = inject(TranslateService);

    telemetry: TelemetryEnvelope[] = [];
    askue: ASCUEMetrics | null = null;
    kpiData: GesKpiData = {
        shutdownsCount: 0,
        dischargesCount: 0,
        currentPower: 0,
        activeAggregates: 0,
        totalAggregates: 0
    };

    loading = false;
    lastUpdated: Date | null = null;

    private destroy$ = new Subject<void>();
    private refreshSubscription?: Subscription;

    ngOnInit(): void {
        this.loadData();
        // Auto-refresh every 2 minutes
        this.refreshSubscription = interval(120000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadData());
    }

    loadData(): void {
        this.loading = true;

        // Load ASKUE data (primary source for KPIs)
        this.gesService.getAskue(this.gesId).subscribe({
            next: (data) => {
                this.askue = data;
                this.kpiData.currentPower = data.active ?? 0;
                this.kpiData.activeAggregates = data.active_agg_count ?? 0;
                this.kpiData.totalAggregates =
                    (data.active_agg_count ?? 0) +
                    (data.pending_agg_count ?? 0) +
                    (data.repair_agg_count ?? 0);
                this.lastUpdated = new Date();
            },
            error: () => {
                // Fallback to telemetry if ASKUE is unavailable
                this.loadTelemetryFallback();
            },
            complete: () => {
                this.loading = false;
            }
        });

        // Load telemetry for aggregates display
        this.gesService.getTelemetry(this.gesId).subscribe({
            next: (data) => {
                this.telemetry = data;
            }
        });

        // Load shutdowns count
        this.gesService.getShutdowns(this.gesId).subscribe({
            next: (data) => {
                this.kpiData.shutdownsCount = data.length;
            }
        });

        // Load discharges count
        this.gesService.getDischarges(this.gesId).subscribe({
            next: (data) => {
                this.kpiData.dischargesCount = data.length;
            }
        });
    }

    private loadTelemetryFallback(): void {
        this.gesService.getTelemetry(this.gesId).subscribe({
            next: (data) => {
                this.telemetry = data;
                this.calculateKpiFromTelemetry();
                this.lastUpdated = new Date();
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    private calculateKpiFromTelemetry(): void {
        let totalPower = 0;
        let activeCount = 0;
        let totalCount = 0;

        this.telemetry.forEach((envelope) => {
            envelope.values.forEach((point) => {
                if (point.name === 'power' || point.name === 'active_power') {
                    totalPower += Number(point.value) || 0;
                }
            });
            totalCount++;
            // Consider device active if it has good quality data
            if (envelope.values.some((v) => v.quality === 'good')) {
                activeCount++;
            }
        });

        this.kpiData.currentPower = totalPower;
        this.kpiData.activeAggregates = activeCount;
        this.kpiData.totalAggregates = totalCount;
    }

    refresh(): void {
        this.loadData();
    }

    getTimeAgo(): string {
        if (!this.lastUpdated) return '';
        const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
        if (seconds < 60) return this.translate.instant('DASHBOARD.JUST_NOW');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} ${this.translate.instant('DASHBOARD.MINUTES_AGO')}`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${this.translate.instant('DASHBOARD.HOURS_AGO')}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.refreshSubscription?.unsubscribe();
    }
}
