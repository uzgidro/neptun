import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { Card } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HRAnalyticsDashboard, REPORT_TYPES } from '@/core/interfaces/hrm/analytics';
import { AnalyticsService } from '@/core/services/analytics.service';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, Card, TranslateModule],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit, OnDestroy {
    dashboard: HRAnalyticsDashboard | null = null;
    loading: boolean = true;
    selectedReportType: string = 'headcount';

    reportTypes = REPORT_TYPES;

    departmentChartData: any;
    genderChartData: any;
    ageChartData: any;
    tenureChartData: any;

    chartOptions: any = {
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    private analyticsService = inject(AnalyticsService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.loadDashboard();
    }

    loadDashboard(): void {
        this.loading = true;

        this.analyticsService
            .getDashboard()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dashboard = data;
                    this.prepareCharts();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.DASHBOARD.LOAD_ERROR') });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    prepareCharts(): void {
        if (!this.dashboard) return;

        // Department chart
        if (this.dashboard.headcount_by_department.length) {
            this.departmentChartData = {
                labels: this.dashboard.headcount_by_department.map((d) => d.department_name),
                datasets: [
                    {
                        data: this.dashboard.headcount_by_department.map((d) => d.headcount),
                        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#EC407A', '#78909C', '#5C6BC0']
                    }
                ]
            };
        }

        // Gender chart
        if (this.dashboard.gender_distribution) {
            this.genderChartData = {
                labels: ['Мужчины', 'Женщины'],
                datasets: [
                    {
                        data: [this.dashboard.gender_distribution.male, this.dashboard.gender_distribution.female],
                        backgroundColor: ['#42A5F5', '#EC407A']
                    }
                ]
            };
        }

        // Age chart
        if (this.dashboard.age_distribution.length) {
            this.ageChartData = {
                labels: this.dashboard.age_distribution.map((a) => a.age_group),
                datasets: [
                    {
                        label: 'Количество',
                        data: this.dashboard.age_distribution.map((a) => a.count),
                        backgroundColor: '#66BB6A'
                    }
                ]
            };
        }

        // Tenure chart
        if (this.dashboard.tenure_distribution.length) {
            this.tenureChartData = {
                labels: this.dashboard.tenure_distribution.map((t) => t.tenure_group),
                datasets: [
                    {
                        label: 'Количество',
                        data: this.dashboard.tenure_distribution.map((t) => t.count),
                        backgroundColor: '#7E57C2'
                    }
                ]
            };
        }
    }

    formatPercent(value: number): string {
        return value.toFixed(1) + '%';
    }

    formatNumber(value: number): string {
        return new Intl.NumberFormat('ru-RU').format(value || 0);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
