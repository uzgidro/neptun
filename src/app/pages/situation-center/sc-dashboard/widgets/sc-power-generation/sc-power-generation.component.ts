import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService, ProductionStatsResponse } from '@/core/services/dashboard.service';

interface ProductionMetric {
    labelKey: string;
    value: number;
    unitKey: string;
    icon: string;
}

@Component({
    selector: 'sc-power-generation',
    standalone: true,
    imports: [DecimalPipe, TranslateModule],
    templateUrl: './sc-power-generation.component.html',
    styleUrl: './sc-power-generation.component.scss'
})
export class ScPowerGenerationComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);

    // Main counter - current day generation in MWh
    currentDayGeneration = 0;
    displayedGeneration = 0;
    private counterSubscription?: Subscription;
    private refreshSubscription?: Subscription;

    // Production metrics
    productionMetrics: ProductionMetric[] = [
        { labelKey: 'SITUATION_CENTER.DASHBOARD.POWER_GENERATION.YEAR_START', value: 0, unitKey: 'SITUATION_CENTER.DASHBOARD.UNITS.MLN_KWH', icon: 'pi-calendar' },
        { labelKey: 'SITUATION_CENTER.DASHBOARD.POWER_GENERATION.MONTH_START', value: 0, unitKey: 'SITUATION_CENTER.DASHBOARD.UNITS.MLN_KWH', icon: 'pi-calendar-minus' },
        { labelKey: 'SITUATION_CENTER.DASHBOARD.POWER_GENERATION.PER_DAY', value: 0, unitKey: 'SITUATION_CENTER.DASHBOARD.UNITS.MLN_KWH', icon: 'pi-clock' }
    ];

    loading = true;

    ngOnInit(): void {
        this.loadProductionStats();
        // Refresh every 5 minutes
        this.refreshSubscription = interval(300000).subscribe(() => {
            this.loadProductionStats();
        });
    }

    private loadProductionStats(): void {
        this.dashboardService.getProductionStats().subscribe({
            next: (data: ProductionStatsResponse) => {
                this.currentDayGeneration = data.current.value;

                this.productionMetrics = [
                    { labelKey: 'SITUATION_CENTER.DASHBOARD.POWER_GENERATION.YEAR_START', value: data.year_total, unitKey: 'SITUATION_CENTER.DASHBOARD.UNITS.MLN_KWH', icon: 'pi-calendar' },
                    { labelKey: 'SITUATION_CENTER.DASHBOARD.POWER_GENERATION.MONTH_START', value: data.month_total, unitKey: 'SITUATION_CENTER.DASHBOARD.UNITS.MLN_KWH', icon: 'pi-calendar-minus' },
                    { labelKey: 'SITUATION_CENTER.DASHBOARD.POWER_GENERATION.PER_DAY', value: data.current.value, unitKey: 'SITUATION_CENTER.DASHBOARD.UNITS.MLN_KWH', icon: 'pi-clock' }
                ];

                if (this.loading) {
                    this.animateCounter();
                    this.loading = false;
                } else {
                    this.displayedGeneration = this.currentDayGeneration;
                }
            },
            error: (err) => {
                console.error('Error loading production stats:', err);
                this.loading = false;
            }
        });
    }

    private animateCounter(): void {
        const duration = 1500;
        const steps = 40;
        const stepValue = this.currentDayGeneration / steps;
        let currentStep = 0;

        this.counterSubscription = interval(duration / steps).subscribe(() => {
            currentStep++;
            if (currentStep >= steps) {
                this.displayedGeneration = this.currentDayGeneration;
                this.counterSubscription?.unsubscribe();
            } else {
                this.displayedGeneration = stepValue * currentStep;
            }
        });
    }

    ngOnDestroy(): void {
        this.counterSubscription?.unsubscribe();
        this.refreshSubscription?.unsubscribe();
    }
}
