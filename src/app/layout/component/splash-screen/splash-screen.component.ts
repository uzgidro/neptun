import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DashboardService, ProductionStatsResponse } from '@/core/services/dashboard.service';

@Component({
    selector: 'app-splash-screen',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './splash-screen.component.html',
    styleUrl: './splash-screen.component.scss',
    animations: [
        trigger('fadeOut', [
            state('visible', style({ opacity: 1 })),
            state('hidden', style({ opacity: 0 })),
            transition('visible => hidden', animate('600ms ease-out'))
        ])
    ]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
    @Input() duration: number = 4000;
    @Output() complete = new EventEmitter<void>();

    private dashboardService = inject(DashboardService);

    isVisible: boolean = true;
    animationState: 'visible' | 'hidden' = 'visible';

    // Power generation data
    currentPower: number = 0;
    targetPower: number = 0;
    dailyPower: number = 0;
    monthlyPower: number = 0;
    yearlyPower: number = 0;
    dataLoaded: boolean = false;

    // Animation states
    lightningActive: boolean = false;
    sideLightning1Active: boolean = false;
    sideLightning2Active: boolean = false;

    private animationInterval: any;
    private powerInterval: any;
    private hideTimeout: any;
    private sideFlashInterval: any;

    ngOnInit(): void {
        this.loadProductionData();
        this.startAnimations();

        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, this.duration);
    }

    ngOnDestroy(): void {
        this.clearIntervals();
    }

    private loadProductionData(): void {
        this.dashboardService.getProductionStats().subscribe({
            next: (data: ProductionStatsResponse) => {
                this.dailyPower = data.current.value;
                this.monthlyPower = data.month_total;
                this.yearlyPower = data.year_total;
                // Показываем дневную выработку в МВт (конвертируем из млн кВт/ч)
                this.targetPower = Math.round(data.current.value * 1000);
                this.dataLoaded = true;
                this.animatePowerCounter();
            },
            error: () => {
                // Fallback to default value
                this.targetPower = 2847;
                this.dataLoaded = true;
                this.animatePowerCounter();
            }
        });
    }

    private startAnimations(): void {
        // Main lightning flash
        this.animationInterval = setInterval(() => {
            this.lightningActive = true;
            setTimeout(() => {
                this.lightningActive = false;
            }, 150);
        }, 800);

        // Side lightning flashes (staggered)
        this.sideFlashInterval = setInterval(() => {
            // Random side flash
            const side = Math.random() > 0.5;
            if (side) {
                this.sideLightning1Active = true;
                setTimeout(() => this.sideLightning1Active = false, 100);
            } else {
                this.sideLightning2Active = true;
                setTimeout(() => this.sideLightning2Active = false, 100);
            }
        }, 600);
    }

    private animatePowerCounter(): void {
        if (this.targetPower === 0) return;

        const step = this.targetPower / 60;
        let current = 0;

        this.powerInterval = setInterval(() => {
            current += step;
            if (current >= this.targetPower) {
                this.currentPower = this.targetPower;
                clearInterval(this.powerInterval);
            } else {
                this.currentPower = Math.round(current);
            }
        }, 35);
    }

    private clearIntervals(): void {
        if (this.animationInterval) clearInterval(this.animationInterval);
        if (this.powerInterval) clearInterval(this.powerInterval);
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        if (this.sideFlashInterval) clearInterval(this.sideFlashInterval);
    }

    hide(): void {
        this.animationState = 'hidden';
        setTimeout(() => {
            this.isVisible = false;
            this.complete.emit();
        }, 600);
    }

    skipSplash(): void {
        this.clearIntervals();
        this.hide();
    }
}
