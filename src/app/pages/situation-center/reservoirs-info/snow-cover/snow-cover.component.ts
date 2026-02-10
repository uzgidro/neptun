import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { SnowCoverService } from '@/core/services/snow-cover.service';
import { SnowCoverResponse } from '@/core/interfaces/snow-cover';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-snow-cover',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ChartModule, TooltipModule, TranslateModule, DateWidget],
    templateUrl: './snow-cover.component.html',
    styleUrl: './snow-cover.component.scss'
})
export class SnowCoverComponent implements OnInit, OnDestroy {
    private snowCoverService = inject(SnowCoverService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    selectedDate: Date = new Date();
    data: SnowCoverResponse | null = null;
    loading = false;
    chartData: any = {};
    chartOptions: any = {};
    chartHeight = '400px';

    ngOnInit(): void {
        this.initChartOptions();
        interval(300000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadData());
        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateChart());
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.snowCoverService
            .getSnowCover(this.selectedDate)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.updateChart();
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
            });
    }

    getDelta(todayItem: any): number | null {
        if (!this.data) return null;
        const yearAgoItem = this.data.year_ago.items.find((i) => i.organization_id === todayItem.organization_id);
        if (todayItem.overall_cover == null || !yearAgoItem || yearAgoItem.overall_cover == null) return null;
        return Math.round((todayItem.overall_cover - yearAgoItem.overall_cover) * 10) / 10;
    }

    getYesterdayCover(orgId: number): number | null {
        if (!this.data) return null;
        const item = this.data.yesterday.items.find((i) => i.organization_id === orgId);
        return item?.overall_cover ?? null;
    }

    getYearAgoCover(orgId: number): number | null {
        if (!this.data) return null;
        const item = this.data.year_ago.items.find((i) => i.organization_id === orgId);
        return item?.overall_cover ?? null;
    }

    getResourceDate(orgId: number): string | null {
        if (!this.data) return null;
        const item = this.data.today.items.find((i) => i.organization_id === orgId);
        return item?.resource_date ?? null;
    }

    private t(key: string): string {
        return this.translate.instant(key);
    }

    private initChartOptions(): void {
        this.chartOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '%'
                    }
                }
            }
        };
    }

    private updateChart(): void {
        if (!this.data) return;

        this.chartHeight = Math.max(400, this.data.today.items.length * 50) + 'px';
        const labels = this.data.today.items.map((i) => i.organization_name);
        const todayData = this.data.today.items.map((i) => i.overall_cover ?? 0);
        const yearAgoData = this.data.today.items.map((i) => {
            const ya = this.data!.year_ago.items.find((y) => y.organization_id === i.organization_id);
            return ya?.overall_cover ?? 0;
        });

        this.chartData = {
            labels,
            datasets: [
                {
                    label: this.t('SNOW_COVER.TODAY'),
                    data: todayData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 1
                },
                {
                    label: this.t('SNOW_COVER.YEAR_AGO'),
                    data: yearAgoData,
                    backgroundColor: 'rgba(156, 163, 175, 0.5)',
                    borderColor: '#9CA3AF',
                    borderWidth: 1
                }
            ]
        };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
