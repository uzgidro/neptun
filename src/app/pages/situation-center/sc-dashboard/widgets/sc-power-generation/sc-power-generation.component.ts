import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { DashboardService, ProductionStatsResponse } from '@/core/services/dashboard.service';

interface ProductionMetric {
    label: string;
    value: number;
    unit: string;
    icon: string;
}

@Component({
    selector: 'sc-power-generation',
    standalone: true,
    imports: [DecimalPipe],
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
        { label: 'С начала года', value: 0, unit: 'млн кВт·ч', icon: 'pi-calendar' },
        { label: 'С начала месяца', value: 0, unit: 'млн кВт·ч', icon: 'pi-calendar-minus' },
        { label: 'За сутки', value: 0, unit: 'млн кВт·ч', icon: 'pi-clock' }
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
                    { label: 'С начала года', value: data.year_total, unit: 'млн кВт·ч', icon: 'pi-calendar' },
                    { label: 'С начала месяца', value: data.month_total, unit: 'млн кВт·ч', icon: 'pi-calendar-minus' },
                    { label: 'За сутки', value: data.current.value, unit: 'млн кВт·ч', icon: 'pi-clock' }
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
