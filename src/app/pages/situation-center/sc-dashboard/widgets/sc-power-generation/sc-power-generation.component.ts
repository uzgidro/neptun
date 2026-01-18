import { Component, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';

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
    // Main counter - total generation in GWh
    totalGeneration = 29515.847;
    displayedGeneration = 0;
    private counterSubscription?: Subscription;
    private incrementSubscription?: Subscription;

    // Production metrics
    productionMetrics: ProductionMetric[] = [
        { label: 'За год', value: 85.9, unit: 'GWh', icon: 'pi-calendar' },
        { label: 'За месяц', value: 1556.7, unit: 'MWh', icon: 'pi-calendar-minus' },
        { label: 'За сутки', value: 234.90, unit: 'MWh', icon: 'pi-clock' }
    ];

    // Current power output
    currentPower = 1247.5; // MW

    ngOnInit(): void {
        this.animateCounter();
        this.startRealTimeIncrement();
    }

    private animateCounter(): void {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepValue = this.totalGeneration / steps;
        let currentStep = 0;

        this.counterSubscription = interval(duration / steps).subscribe(() => {
            currentStep++;
            if (currentStep >= steps) {
                this.displayedGeneration = this.totalGeneration;
                this.counterSubscription?.unsubscribe();
            } else {
                this.displayedGeneration = stepValue * currentStep;
            }
        });
    }

    private startRealTimeIncrement(): void {
        // Simulate real-time generation increment
        this.incrementSubscription = interval(3000).subscribe(() => {
            // Add small random increment (simulating real-time generation)
            const increment = Math.random() * 0.005;
            this.totalGeneration += increment;
            this.displayedGeneration = this.totalGeneration;
        });
    }

    formatMainCounter(value: number): string {
        return value.toLocaleString('ru-RU', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        });
    }

    ngOnDestroy(): void {
        this.counterSubscription?.unsubscribe();
        this.incrementSubscription?.unsubscribe();
    }
}
