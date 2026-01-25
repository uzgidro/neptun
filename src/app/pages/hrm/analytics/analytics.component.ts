import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { Card } from 'primeng/card';
import { HRAnalyticsDashboard, REPORT_TYPES } from '@/core/interfaces/hrm/analytics';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        Card
    ],
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

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.loadMockData();
    }

    private loadMockData(): void {
        setTimeout(() => {
            this.dashboard = {
                total_employees: 156,
                active_employees: 148,
                new_hires_this_month: 5,
                terminations_this_month: 2,
                turnover_rate: 8.5,
                average_tenure: 3.2,
                headcount_by_department: [
                    { department_id: 1, department_name: 'IT отдел', headcount: 45, percentage: 28.8 },
                    { department_id: 2, department_name: 'Бухгалтерия', headcount: 18, percentage: 11.5 },
                    { department_id: 3, department_name: 'Отдел кадров', headcount: 12, percentage: 7.7 },
                    { department_id: 4, department_name: 'Юридический отдел', headcount: 8, percentage: 5.1 },
                    { department_id: 5, department_name: 'Отдел продаж', headcount: 32, percentage: 20.5 },
                    { department_id: 6, department_name: 'Маркетинг', headcount: 15, percentage: 9.6 },
                    { department_id: 7, department_name: 'Производство', headcount: 18, percentage: 11.5 },
                    { department_id: 8, department_name: 'Администрация', headcount: 8, percentage: 5.1 }
                ],
                headcount_by_position: [
                    { position_id: 1, position_name: 'Разработчик', headcount: 28, percentage: 17.9 },
                    { position_id: 2, position_name: 'Менеджер', headcount: 22, percentage: 14.1 },
                    { position_id: 3, position_name: 'Специалист', headcount: 45, percentage: 28.8 },
                    { position_id: 4, position_name: 'Руководитель', headcount: 12, percentage: 7.7 },
                    { position_id: 5, position_name: 'Аналитик', headcount: 18, percentage: 11.5 },
                    { position_id: 6, position_name: 'Другие', headcount: 31, percentage: 19.9 }
                ],
                gender_distribution: {
                    male: 89,
                    female: 67,
                    male_percentage: 57.1,
                    female_percentage: 42.9
                },
                age_distribution: [
                    { age_group: '18-25', count: 18, percentage: 11.5 },
                    { age_group: '26-35', count: 62, percentage: 39.7 },
                    { age_group: '36-45', count: 48, percentage: 30.8 },
                    { age_group: '46-55', count: 22, percentage: 14.1 },
                    { age_group: '56+', count: 6, percentage: 3.8 }
                ],
                tenure_distribution: [
                    { tenure_group: 'Менее 1 года', count: 28, percentage: 17.9 },
                    { tenure_group: '1-2 года', count: 35, percentage: 22.4 },
                    { tenure_group: '2-5 лет', count: 52, percentage: 33.3 },
                    { tenure_group: '5-10 лет', count: 31, percentage: 19.9 },
                    { tenure_group: 'Более 10 лет', count: 10, percentage: 6.4 }
                ]
            };
            this.prepareCharts();
            this.loading = false;
        }, 500);
    }

    loadDashboard(): void {
        this.loading = true;
        this.loadMockData();
    }

    prepareCharts(): void {
        if (!this.dashboard) return;

        // Department chart
        if (this.dashboard.headcount_by_department.length) {
            this.departmentChartData = {
                labels: this.dashboard.headcount_by_department.map(d => d.department_name),
                datasets: [{
                    data: this.dashboard.headcount_by_department.map(d => d.headcount),
                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#EC407A', '#78909C', '#5C6BC0']
                }]
            };
        }

        // Gender chart
        if (this.dashboard.gender_distribution) {
            this.genderChartData = {
                labels: ['Мужчины', 'Женщины'],
                datasets: [{
                    data: [this.dashboard.gender_distribution.male, this.dashboard.gender_distribution.female],
                    backgroundColor: ['#42A5F5', '#EC407A']
                }]
            };
        }

        // Age chart
        if (this.dashboard.age_distribution.length) {
            this.ageChartData = {
                labels: this.dashboard.age_distribution.map(a => a.age_group),
                datasets: [{
                    label: 'Количество',
                    data: this.dashboard.age_distribution.map(a => a.count),
                    backgroundColor: '#66BB6A'
                }]
            };
        }

        // Tenure chart
        if (this.dashboard.tenure_distribution.length) {
            this.tenureChartData = {
                labels: this.dashboard.tenure_distribution.map(t => t.tenure_group),
                datasets: [{
                    label: 'Количество',
                    data: this.dashboard.tenure_distribution.map(t => t.count),
                    backgroundColor: '#7E57C2'
                }]
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
