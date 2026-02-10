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

    zonesChartData: any = {};
    zonesChartOptions: any = {};

    ngOnInit(): void {
        this.initChartOptions();
        this.initZonesChartOptions();
        interval(300000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadData());
        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updateChart();
            this.updateZonesChart();
        });
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
                    this.updateZonesChart();
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

    private initZonesChartOptions(): void {
        this.zonesChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: this.t('SNOW_COVER.ELEVATION')
                    }
                },
                y: {
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

    private updateZonesChart(): void {
        if (!this.data) return;

        const itemsWithZones = this.data.today.items.filter(i => i.zones && i.zones.length > 0);
        if (itemsWithZones.length === 0) {
            this.zonesChartData = {};
            return;
        }

        const allRanges = new Set<string>();
        const rangeKeys: { key: string; min: number; max: number }[] = [];

        for (const item of itemsWithZones) {
            for (const z of item.zones!) {
                const key = `${z.min_elev}–${z.max_elev}`;
                if (!allRanges.has(key)) {
                    allRanges.add(key);
                    rangeKeys.push({ key, min: z.min_elev, max: z.max_elev });
                }
            }
        }

        rangeKeys.sort((a, b) => a.min - b.min);
        const labels = rangeKeys.map(r => r.key);

        const colors = [
            '#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
            '#14B8A6', '#E11D48', '#0EA5E9', '#A855F7', '#10B981'
        ];

        const datasets = itemsWithZones.map((item, idx) => {
            const data = labels.map(label => {
                const zone = item.zones!.find(z => `${z.min_elev}–${z.max_elev}` === label);
                return zone?.sca_pct ?? null;
            });
            const color = colors[idx % colors.length];
            return {
                label: item.organization_name,
                data,
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,
                pointRadius: 4,
                spanGaps: true
            };
        });

        this.zonesChartData = { labels, datasets };
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
