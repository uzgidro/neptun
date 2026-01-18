import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '@/core/services/dashboard.service';
import { Organization } from '@/core/interfaces/organizations';

interface DischargeItem {
    id: number;
    name: string;
    currentDischarge: number;
}

@Component({
    selector: 'sc-discharges',
    standalone: true,
    imports: [DecimalPipe, TranslateModule],
    templateUrl: './sc-discharges.component.html',
    styleUrl: './sc-discharges.component.scss'
})
export class ScDischargesComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private translateService = inject(TranslateService);
    private refreshSubscription?: Subscription;

    discharges: DischargeItem[] = [];
    loading = true;
    lastUpdated: Date | null = null;

    ngOnInit(): void {
        this.loadData();
        this.refreshSubscription = interval(600000).subscribe(() => this.loadData()); // 10 минут
    }

    private loadData(): void {
        this.loading = true;
        this.dashboardService.getOrganizationsCascades().subscribe({
            next: (cascades: Organization[]) => {
                this.extractDischarges(cascades);
                this.lastUpdated = new Date();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading discharges:', err);
                this.loading = false;
            }
        });
    }

    private extractDischarges(cascades: Organization[]): void {
        const items: DischargeItem[] = [];

        // Берём только детей (items), не родителей
        cascades.forEach(cascade => {
            if (cascade.items && cascade.items.length > 0) {
                cascade.items.forEach(child => {
                    if (child.current_discharge && child.current_discharge > 0) {
                        items.push({
                            id: child.id,
                            name: child.name,
                            currentDischarge: child.current_discharge
                        });
                    }
                });
            }
        });

        this.discharges = items;
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

    get totalDischarge(): number {
        return this.discharges.reduce((sum, d) => sum + d.currentDischarge, 0);
    }

    get activeCount(): number {
        return this.discharges.length;
    }

    getIntensity(value: number): string {
        if (value > 200) return 'high';
        if (value > 100) return 'medium';
        return 'low';
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }
}
