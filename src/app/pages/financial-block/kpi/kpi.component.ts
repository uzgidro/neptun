import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ChartModule } from 'primeng/chart';
import { TextareaModule } from 'primeng/textarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { KnobModule } from 'primeng/knob';
import { FinancialDashboardService } from '../dashboard/services/financial-dashboard.service';

interface KpiCategory {
    label: string;
    value: string;
    icon: string;
}

interface KpiPeriod {
    label: string;
    value: string;
}

interface KpiUnit {
    label: string;
    value: string;
}

interface KpiRecord {
    id: number;
    name: string;
    category: 'production' | 'financial' | 'operational' | 'hr';
    department: string;
    period: 'month' | 'quarter' | 'year';
    periodDate: Date;
    unit: string;
    targetValue: number;
    actualValue: number;
    minThreshold: number;
    weight: number;
    trend: 'up' | 'down' | 'stable';
    responsiblePerson: string;
    notes: string;
}

@Component({
    selector: 'app-kpi',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        DatePickerModule,
        TagModule,
        TooltipModule,
        ConfirmDialogModule,
        ToastModule,
        InputGroupModule,
        InputGroupAddonModule,
        ChartModule,
        TextareaModule,
        ProgressBarModule,
        KnobModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './kpi.component.html',
    styleUrl: './kpi.component.scss'
})
export class KpiComponent implements OnInit {
    kpis: KpiRecord[] = [];
    filteredKpis: KpiRecord[] = [];

    // Dialog
    kpiDialog: boolean = false;
    isEditMode: boolean = false;
    currentKpi: KpiRecord = this.getEmptyKpi();

    // Filters
    searchText: string = '';
    selectedCategory: string | null = null;
    selectedDepartment: string | null = null;
    selectedPeriod: string | null = null;
    selectedStatus: string | null = null;

    // Overall KPI value for gauge
    overallKpi: number = 0;

    // Dropdown options
    categories: KpiCategory[] = [
        { label: 'Производство', value: 'production', icon: 'pi pi-bolt' },
        { label: 'Финансы', value: 'financial', icon: 'pi pi-wallet' },
        { label: 'Операционные', value: 'operational', icon: 'pi pi-cog' },
        { label: 'HR', value: 'hr', icon: 'pi pi-users' }
    ];

    periods: KpiPeriod[] = [
        { label: 'Месяц', value: 'month' },
        { label: 'Квартал', value: 'quarter' },
        { label: 'Год', value: 'year' }
    ];

    units: KpiUnit[] = [
        { label: '%', value: 'percent' },
        { label: 'кВт*ч', value: 'kwh' },
        { label: 'МВт*ч', value: 'mwh' },
        { label: 'UZS', value: 'uzs' },
        { label: 'млн UZS', value: 'mln_uzs' },
        { label: 'шт', value: 'pcs' },
        { label: 'дни', value: 'days' },
        { label: 'часы', value: 'hours' },
        { label: 'чел', value: 'people' }
    ];

    departments = [
        { label: 'Производственный отдел', value: 'production' },
        { label: 'Финансовый отдел', value: 'finance' },
        { label: 'Технический отдел', value: 'technical' },
        { label: 'IT отдел', value: 'it' },
        { label: 'Отдел кадров', value: 'hr' },
        { label: 'Административный отдел', value: 'admin' }
    ];

    statuses = [
        { label: 'Выполнено', value: 'achieved' },
        { label: 'Внимание', value: 'warning' },
        { label: 'Критично', value: 'critical' }
    ];

    trends = [
        { label: 'Рост', value: 'up', icon: 'pi pi-arrow-up' },
        { label: 'Падение', value: 'down', icon: 'pi pi-arrow-down' },
        { label: 'Стабильно', value: 'stable', icon: 'pi pi-minus' }
    ];

    // Charts
    radarChartData: any;
    radarChartOptions: any;
    barChartData: any;
    barChartOptions: any;
    lineChartData: any;
    lineChartOptions: any;
    statusChartData: any;
    statusChartOptions: any;

    private dashboardService = inject(FinancialDashboardService);

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadKpis();
        this.applyFilters();
        this.initCharts();
        this.updateDashboardData();
    }

    private updateDashboardData(): void {
        const criticalCount = this.kpis.filter(k => this.getAchievementPercent(k) < 80).length;
        const warningCount = this.kpis.filter(k => {
            const achievement = this.getAchievementPercent(k);
            return achievement >= 80 && achievement < 100;
        }).length;
        const completedCount = this.kpis.filter(k => this.getAchievementPercent(k) >= 100).length;

        this.dashboardService.updateKpi({
            overallKpi: this.overallKpi,
            criticalCount,
            warningCount,
            completedCount,
            totalCount: this.kpis.length
        });
    }

    loadKpis() {
        this.kpis = [
            // Production KPIs
            { id: 1, name: 'КИУМ (коэффициент использования мощности)', category: 'production', department: 'production', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 85, actualValue: 87.5, minThreshold: 75, weight: 15, trend: 'up', responsiblePerson: 'Иванов И.И.', notes: '' },
            { id: 2, name: 'Выработка электроэнергии', category: 'production', department: 'production', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'mwh', targetValue: 150000, actualValue: 148500, minThreshold: 135000, weight: 15, trend: 'stable', responsiblePerson: 'Иванов И.И.', notes: '' },
            { id: 3, name: 'Коэффициент готовности оборудования', category: 'production', department: 'technical', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 98, actualValue: 96.5, minThreshold: 92, weight: 10, trend: 'down', responsiblePerson: 'Петров П.П.', notes: 'Плановый ремонт турбины №2' },
            { id: 4, name: 'Потери в сетях', category: 'production', department: 'technical', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 5, actualValue: 4.8, minThreshold: 8, weight: 10, trend: 'up', responsiblePerson: 'Петров П.П.', notes: '' },

            // Financial KPIs
            { id: 5, name: 'Выручка', category: 'financial', department: 'finance', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'mln_uzs', targetValue: 5000, actualValue: 5250, minThreshold: 4500, weight: 12, trend: 'up', responsiblePerson: 'Сидорова А.А.', notes: '' },
            { id: 6, name: 'Рентабельность', category: 'financial', department: 'finance', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 25, actualValue: 23.5, minThreshold: 20, weight: 10, trend: 'stable', responsiblePerson: 'Сидорова А.А.', notes: '' },
            { id: 7, name: 'Дебиторская задолженность', category: 'financial', department: 'finance', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'mln_uzs', targetValue: 200, actualValue: 280, minThreshold: 350, weight: 8, trend: 'down', responsiblePerson: 'Сидорова А.А.', notes: 'Превышение нормы' },
            { id: 8, name: 'Выполнение бюджета', category: 'financial', department: 'finance', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 100, actualValue: 95, minThreshold: 90, weight: 8, trend: 'stable', responsiblePerson: 'Сидорова А.А.', notes: '' },

            // Operational KPIs
            { id: 9, name: 'Выполнение плана ремонтов', category: 'operational', department: 'technical', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 100, actualValue: 92, minThreshold: 85, weight: 8, trend: 'up', responsiblePerson: 'Козлов К.К.', notes: '' },
            { id: 10, name: 'Количество аварий', category: 'operational', department: 'technical', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'pcs', targetValue: 0, actualValue: 2, minThreshold: 5, weight: 10, trend: 'down', responsiblePerson: 'Козлов К.К.', notes: '2 мелких инцидента' },
            { id: 11, name: 'Среднее время устранения аварий', category: 'operational', department: 'technical', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'hours', targetValue: 4, actualValue: 3.5, minThreshold: 8, weight: 6, trend: 'up', responsiblePerson: 'Козлов К.К.', notes: '' },
            { id: 12, name: 'Выполнение инвестпрограммы', category: 'operational', department: 'finance', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 100, actualValue: 78, minThreshold: 70, weight: 8, trend: 'stable', responsiblePerson: 'Новиков Н.Н.', notes: 'Задержка поставок' },

            // HR KPIs
            { id: 13, name: 'Укомплектованность штата', category: 'hr', department: 'hr', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 100, actualValue: 96, minThreshold: 90, weight: 5, trend: 'stable', responsiblePerson: 'Морозова М.М.', notes: '' },
            { id: 14, name: 'Текучесть кадров', category: 'hr', department: 'hr', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'percent', targetValue: 5, actualValue: 3.2, minThreshold: 10, weight: 5, trend: 'up', responsiblePerson: 'Морозова М.М.', notes: '' },
            { id: 15, name: 'Обучение персонала', category: 'hr', department: 'hr', period: 'month', periodDate: new Date(2024, 11, 1), unit: 'people', targetValue: 50, actualValue: 48, minThreshold: 40, weight: 5, trend: 'stable', responsiblePerson: 'Морозова М.М.', notes: '' }
        ];
    }

    // Calculate KPI achievement percentage
    getAchievementPercent(kpi: KpiRecord): number {
        if (kpi.targetValue === 0) return 0;

        // For metrics where lower is better (like accidents, losses, debts)
        const lowerIsBetter = ['Количество аварий', 'Потери в сетях', 'Дебиторская задолженность', 'Текучесть кадров', 'Среднее время устранения аварий'];

        if (lowerIsBetter.some(name => kpi.name.includes(name))) {
            if (kpi.actualValue <= kpi.targetValue) {
                return 100 + ((kpi.targetValue - kpi.actualValue) / kpi.targetValue) * 100;
            }
            return Math.max(0, (1 - (kpi.actualValue - kpi.targetValue) / (kpi.minThreshold - kpi.targetValue)) * 100);
        }

        return (kpi.actualValue / kpi.targetValue) * 100;
    }

    // Get status based on achievement
    getKpiStatus(kpi: KpiRecord): 'achieved' | 'warning' | 'critical' {
        const percent = this.getAchievementPercent(kpi);
        if (percent >= 100) return 'achieved';
        if (percent >= 80) return 'warning';
        return 'critical';
    }

    // Computed totals
    get achievedCount(): number {
        return this.filteredKpis.filter(k => this.getKpiStatus(k) === 'achieved').length;
    }

    get warningCount(): number {
        return this.filteredKpis.filter(k => this.getKpiStatus(k) === 'warning').length;
    }

    get criticalCount(): number {
        return this.filteredKpis.filter(k => this.getKpiStatus(k) === 'critical').length;
    }

    calculateOverallKpi(): number {
        if (this.filteredKpis.length === 0) return 0;

        let totalWeight = 0;
        let weightedSum = 0;

        this.filteredKpis.forEach(kpi => {
            const achievement = Math.min(this.getAchievementPercent(kpi), 120); // Cap at 120%
            weightedSum += achievement * kpi.weight;
            totalWeight += kpi.weight;
        });

        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    // Filters
    applyFilters() {
        let result = [...this.kpis];

        // Search filter
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            result = result.filter(k =>
                k.name.toLowerCase().includes(search) ||
                k.responsiblePerson.toLowerCase().includes(search)
            );
        }

        // Category filter
        if (this.selectedCategory) {
            result = result.filter(k => k.category === this.selectedCategory);
        }

        // Department filter
        if (this.selectedDepartment) {
            result = result.filter(k => k.department === this.selectedDepartment);
        }

        // Period filter
        if (this.selectedPeriod) {
            result = result.filter(k => k.period === this.selectedPeriod);
        }

        // Status filter
        if (this.selectedStatus) {
            result = result.filter(k => this.getKpiStatus(k) === this.selectedStatus);
        }

        this.filteredKpis = result;
        this.overallKpi = this.calculateOverallKpi();

        // Update charts only if they are initialized
        if (this.radarChartData) {
            this.updateCharts();
        }
    }

    clearFilters() {
        this.searchText = '';
        this.selectedCategory = null;
        this.selectedDepartment = null;
        this.selectedPeriod = null;
        this.selectedStatus = null;
        this.applyFilters();
    }

    // CRUD Operations
    getEmptyKpi(): KpiRecord {
        return {
            id: 0,
            name: '',
            category: 'production',
            department: 'production',
            period: 'month',
            periodDate: new Date(),
            unit: 'percent',
            targetValue: 0,
            actualValue: 0,
            minThreshold: 0,
            weight: 5,
            trend: 'stable',
            responsiblePerson: '',
            notes: ''
        };
    }

    openNewKpi() {
        this.currentKpi = this.getEmptyKpi();
        this.isEditMode = false;
        this.kpiDialog = true;
    }

    editKpi(kpi: KpiRecord) {
        this.currentKpi = { ...kpi };
        this.isEditMode = true;
        this.kpiDialog = true;
    }

    saveKpi() {
        if (!this.currentKpi.name) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Введите название показателя'
            });
            return;
        }

        if (this.currentKpi.targetValue === 0 && this.currentKpi.unit !== 'pcs') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Укажите целевое значение'
            });
            return;
        }

        if (this.isEditMode) {
            const index = this.kpis.findIndex(k => k.id === this.currentKpi.id);
            if (index !== -1) {
                this.kpis[index] = { ...this.currentKpi };
            }
            this.messageService.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Показатель обновлён'
            });
        } else {
            this.currentKpi.id = Math.max(...this.kpis.map(k => k.id), 0) + 1;
            this.kpis.push({ ...this.currentKpi });
            this.messageService.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Показатель добавлен'
            });
        }

        this.applyFilters();
        this.updateDashboardData();
        this.kpiDialog = false;
    }

    deleteKpi(kpi: KpiRecord) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить показатель "${kpi.name}"?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Да',
            rejectLabel: 'Нет',
            accept: () => {
                this.kpis = this.kpis.filter(k => k.id !== kpi.id);
                this.applyFilters();
                this.updateDashboardData();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Успешно',
                    detail: 'Показатель удалён'
                });
            }
        });
    }

    // Helpers
    getCategoryLabel(value: string): string {
        return this.categories.find(c => c.value === value)?.label || value;
    }

    getCategoryIcon(value: string): string {
        return this.categories.find(c => c.value === value)?.icon || 'pi pi-chart-line';
    }

    getPeriodLabel(value: string): string {
        return this.periods.find(p => p.value === value)?.label || value;
    }

    getUnitLabel(value: string): string {
        return this.units.find(u => u.value === value)?.label || value;
    }

    getDepartmentLabel(value: string): string {
        return this.departments.find(d => d.value === value)?.label || value;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'achieved': return 'Выполнено';
            case 'warning': return 'Внимание';
            case 'critical': return 'Критично';
            default: return status;
        }
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'achieved': return 'success';
            case 'warning': return 'warn';
            case 'critical': return 'danger';
            default: return 'secondary';
        }
    }

    getTrendIcon(trend: string): string {
        switch (trend) {
            case 'up': return 'pi pi-arrow-up';
            case 'down': return 'pi pi-arrow-down';
            case 'stable': return 'pi pi-minus';
            default: return 'pi pi-minus';
        }
    }

    getTrendClass(trend: string): string {
        switch (trend) {
            case 'up': return 'text-green-500';
            case 'down': return 'text-red-500';
            case 'stable': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    }

    getProgressBarColor(kpi: KpiRecord): string {
        const status = this.getKpiStatus(kpi);
        switch (status) {
            case 'achieved': return '#22C55E';
            case 'warning': return '#F59E0B';
            case 'critical': return '#EF4444';
            default: return '#6B7280';
        }
    }

    formatValue(value: number, unit: string): string {
        if (unit === 'uzs' || unit === 'mln_uzs') {
            return new Intl.NumberFormat('ru-RU').format(value) + ' ' + this.getUnitLabel(unit);
        }
        if (unit === 'percent') {
            return value.toFixed(1) + '%';
        }
        return new Intl.NumberFormat('ru-RU').format(value) + ' ' + this.getUnitLabel(unit);
    }

    getOverallKpiColor(): string {
        if (this.overallKpi >= 100) return '#22C55E';
        if (this.overallKpi >= 80) return '#F59E0B';
        return '#EF4444';
    }

    // Export to Excel
    exportToExcel() {
        const data = this.filteredKpis.map(k => ({
            'Показатель': k.name,
            'Категория': this.getCategoryLabel(k.category),
            'Отдел': this.getDepartmentLabel(k.department),
            'Период': this.getPeriodLabel(k.period),
            'Ед.изм.': this.getUnitLabel(k.unit),
            'Цель': k.targetValue,
            'Факт': k.actualValue,
            'Выполнение %': this.getAchievementPercent(k).toFixed(1),
            'Статус': this.getStatusLabel(this.getKpiStatus(k)),
            'Вес': k.weight,
            'Ответственный': k.responsiblePerson,
            'Примечания': k.notes
        }));

        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(';'),
            ...data.map(row => headers.map(h => row[h as keyof typeof row]).join(';'))
        ].join('\n');

        // Add BOM for Excel to recognize UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Download file
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `kpi-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.messageService.add({
            severity: 'success',
            summary: 'Экспорт',
            detail: 'Файл успешно экспортирован'
        });
    }

    // Charts
    initCharts() {
        this.initChartOptions();
        this.updateCharts();
    }

    initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        // Radar Chart Options
        this.radarChartOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 16
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 120,
                    ticks: {
                        stepSize: 20,
                        color: textColorSecondary,
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: surfaceBorder
                    },
                    pointLabels: {
                        color: textColor,
                        font: { size: 11 }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Bar Chart Options
        this.barChartOptions = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { display: false }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Line Chart Options
        this.lineChartOptions = {
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                },
                y: {
                    min: 0,
                    max: 120,
                    ticks: {
                        color: textColorSecondary,
                        callback: (value: number) => value + '%'
                    },
                    grid: { color: surfaceBorder }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Status Doughnut Chart Options
        this.statusChartOptions = {
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 16
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };
    }

    updateCharts() {
        this.updateRadarChart();
        this.updateBarChart();
        this.updateLineChart();
        this.updateStatusChart();
    }

    updateRadarChart() {
        const categoryAchievements: { [key: string]: number[] } = {
            production: [],
            financial: [],
            operational: [],
            hr: []
        };

        this.filteredKpis.forEach(kpi => {
            const achievement = Math.min(this.getAchievementPercent(kpi), 120);
            categoryAchievements[kpi.category].push(achievement);
        });

        const labels = this.categories.map(c => c.label);
        const data = this.categories.map(c => {
            const achievements = categoryAchievements[c.value];
            return achievements.length > 0
                ? Math.round(achievements.reduce((a, b) => a + b, 0) / achievements.length)
                : 0;
        });

        this.radarChartData = {
            labels: labels,
            datasets: [{
                label: 'Выполнение KPI',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3B82F6',
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3B82F6'
            }]
        };
    }

    updateBarChart() {
        // Take top 8 KPIs by weight
        const topKpis = [...this.filteredKpis]
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 8);

        const labels = topKpis.map(k => k.name.length > 25 ? k.name.substring(0, 25) + '...' : k.name);
        const targetData = topKpis.map(k => k.targetValue);
        const actualData = topKpis.map(k => k.actualValue);

        this.barChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Цель',
                    data: targetData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Факт',
                    data: actualData,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22C55E',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        };
    }

    updateLineChart() {
        const months = ['Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        // Simulated historical data
        const historicalData = [82, 85, 88, 86, 91, this.overallKpi];

        this.lineChartData = {
            labels: months,
            datasets: [{
                label: 'Общий KPI',
                data: historicalData,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3B82F6',
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        };
    }

    updateStatusChart() {
        const achieved = this.achievedCount;
        const warning = this.warningCount;
        const critical = this.criticalCount;

        this.statusChartData = {
            labels: ['Выполнено', 'Внимание', 'Критично'],
            datasets: [{
                data: [achieved, warning, critical],
                backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
                hoverBackgroundColor: ['#16A34A', '#D97706', '#DC2626'],
                borderWidth: 0
            }]
        };
    }
}
