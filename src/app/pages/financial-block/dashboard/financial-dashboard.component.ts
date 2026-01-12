import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subscription } from 'rxjs';

import { FinancialDashboardService } from './services/financial-dashboard.service';
import { FinancialDashboardData, ModuleCard, MetricItem } from './models/financial-summary.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-financial-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ChartModule,
        CardModule,
        ButtonModule,
        TagModule,
        TooltipModule,
        DividerModule,
        ProgressBarModule,
        TranslateModule
    ],
    templateUrl: './financial-dashboard.component.html',
    styleUrl: './financial-dashboard.component.scss'
})
export class FinancialDashboardComponent implements OnInit, OnDestroy {
    private dashboardService = inject(FinancialDashboardService);
    private router = inject(Router);
    private subscription = new Subscription();

    dashboardData: FinancialDashboardData | null = null;
    moduleCards: ModuleCard[] = [];

    // Сводные показатели
    totalIncome = 0;
    totalExpenses = 0;
    netBalance = 0;

    // Графики
    overviewChartData: any;
    overviewChartOptions: any;
    expensesChartData: any;
    expensesChartOptions: any;
    cashFlowChartData: any;
    cashFlowChartOptions: any;

    ngOnInit(): void {
        this.subscription.add(
            this.dashboardService.dashboardData$.subscribe(data => {
                this.dashboardData = data;
                this.updateMetrics();
                this.updateCharts();
            })
        );

        this.moduleCards = this.dashboardService.getModuleCards();
        this.initChartOptions();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private updateMetrics(): void {
        this.totalIncome = this.dashboardService.getTotalIncome();
        this.totalExpenses = this.dashboardService.getTotalExpenses();
        this.netBalance = this.dashboardService.getNetBalance();
        this.moduleCards = this.dashboardService.getModuleCards();
    }

    private initChartOptions(): void {
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('ru-RU', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value) + ' UZS';
        };

        this.overviewChartOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 13, weight: '500' }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return ` ${context.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            cutout: '65%'
        };

        this.expensesChartOptions = {
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        };

        this.cashFlowChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: number) => {
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                            return value.toString();
                        }
                    }
                }
            }
        };
    }

    private updateCharts(): void {
        if (!this.dashboardData) return;

        const data = this.dashboardData;

        // Обзорная диаграмма (доходы vs расходы)
        this.overviewChartData = {
            labels: ['Доходы', 'Расходы'],
            datasets: [{
                data: [this.totalIncome, this.totalExpenses],
                backgroundColor: ['#22C55E', '#EF4444'],
                borderWidth: 0
            }]
        };

        // Структура расходов
        this.expensesChartData = {
            labels: ['Дебит/Кредит', 'Инвестиции', 'Ремонт', 'Закупки', 'ЗП'],
            datasets: [{
                data: [
                    data.debitCredit.totalCredit,
                    data.investment.totalCredit,
                    data.repairCosts.totalActualCost,
                    data.procurement.deliveredAmount,
                    data.salary.totalNetPay
                ],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'],
                borderWidth: 0
            }]
        };

        // Денежный поток (симуляция по месяцам)
        const months = ['Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        this.cashFlowChartData = {
            labels: months,
            datasets: [
                {
                    label: 'Доходы',
                    data: this.generateMonthlyData(this.totalIncome),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: '#22C55E',
                    borderWidth: 2
                },
                {
                    label: 'Расходы',
                    data: this.generateMonthlyData(this.totalExpenses),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: '#EF4444',
                    borderWidth: 2
                }
            ]
        };
    }

    private generateMonthlyData(total: number): number[] {
        const baseValue = total / 6;
        return [
            baseValue * 0.85,
            baseValue * 0.92,
            baseValue * 1.05,
            baseValue * 0.98,
            baseValue * 1.1,
            baseValue * 1.1
        ].map(v => Math.round(v));
    }

    navigateToModule(route: string): void {
        this.router.navigate([route]);
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value) + ' UZS';
    }

    formatMetricValue(metric: MetricItem): string {
        const value = typeof metric.value === 'number' ? metric.value : parseFloat(metric.value as string) || 0;

        switch (metric.format) {
            case 'currency':
                return this.formatCurrency(value);
            case 'percent':
                return value.toFixed(1) + '%';
            case 'number':
            default:
                return value.toLocaleString('ru-RU');
        }
    }

    getMetricSeverity(color?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (color) {
            case 'success': return 'success';
            case 'warning': return 'warn';
            case 'danger': return 'danger';
            case 'info': return 'info';
            default: return 'secondary';
        }
    }

    getBalanceClass(): string {
        return this.netBalance >= 0 ? 'positive' : 'negative';
    }

    getKpiProgress(): number {
        return this.dashboardData?.kpi.overallKpi || 0;
    }

    getKpiColor(): string {
        const kpi = this.getKpiProgress();
        if (kpi >= 100) return '#22C55E';
        if (kpi >= 80) return '#F59E0B';
        return '#EF4444';
    }
}
