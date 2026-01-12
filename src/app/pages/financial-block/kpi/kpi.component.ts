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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
        KnobModule,
        TranslateModule
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

    // Dropdown options - initialized in initTranslations()
    categories: KpiCategory[] = [];
    periods: KpiPeriod[] = [];
    units: KpiUnit[] = [];
    departments: { label: string; value: string }[] = [];
    statuses: { label: string; value: string }[] = [];
    trends: { label: string; value: string; icon: string }[] = [];

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
    private translate = inject(TranslateService);

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.initTranslations();
        this.loadKpis();
        this.applyFilters();
        this.initCharts();
        this.updateDashboardData();

        this.translate.onLangChange.subscribe(() => {
            this.initTranslations();
            this.updateCharts();
        });
    }

    private initTranslations(): void {
        const t = this.translate;

        this.categories = [
            { label: t.instant('FINANCIAL_BLOCK.KPI.CATEGORY_PRODUCTION'), value: 'production', icon: 'pi pi-bolt' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.CATEGORY_FINANCIAL'), value: 'financial', icon: 'pi pi-wallet' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.CATEGORY_OPERATIONAL'), value: 'operational', icon: 'pi pi-cog' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.CATEGORY_HR'), value: 'hr', icon: 'pi pi-users' }
        ];

        this.periods = [
            { label: t.instant('FINANCIAL_BLOCK.KPI.PERIOD_MONTH'), value: 'month' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.PERIOD_QUARTER'), value: 'quarter' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.PERIOD_YEAR'), value: 'year' }
        ];

        this.units = [
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_PERCENT'), value: 'percent' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_KWH'), value: 'kwh' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_MWH'), value: 'mwh' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_UZS'), value: 'uzs' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_MLN_UZS'), value: 'mln_uzs' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_PCS'), value: 'pcs' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_DAYS'), value: 'days' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_HOURS'), value: 'hours' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.UNIT_PEOPLE'), value: 'people' }
        ];

        this.departments = [
            { label: t.instant('FINANCIAL_BLOCK.KPI.DEPT_PRODUCTION'), value: 'production' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.DEPT_FINANCE'), value: 'finance' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.DEPT_TECHNICAL'), value: 'technical' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.DEPT_IT'), value: 'it' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.DEPT_HR'), value: 'hr' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.DEPT_ADMIN'), value: 'admin' }
        ];

        this.statuses = [
            { label: t.instant('FINANCIAL_BLOCK.KPI.STATUS_ACHIEVED'), value: 'achieved' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.STATUS_WARNING'), value: 'warning' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.STATUS_CRITICAL'), value: 'critical' }
        ];

        this.trends = [
            { label: t.instant('FINANCIAL_BLOCK.KPI.TREND_UP'), value: 'up', icon: 'pi pi-arrow-up' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.TREND_DOWN'), value: 'down', icon: 'pi pi-arrow-down' },
            { label: t.instant('FINANCIAL_BLOCK.KPI.TREND_STABLE'), value: 'stable', icon: 'pi pi-minus' }
        ];
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
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.KPI.ENTER_NAME')
            });
            return;
        }

        if (this.currentKpi.targetValue === 0 && this.currentKpi.unit !== 'pcs') {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.KPI.SPECIFY_TARGET')
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
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.KPI.KPI_UPDATED')
            });
        } else {
            this.currentKpi.id = Math.max(...this.kpis.map(k => k.id), 0) + 1;
            this.kpis.push({ ...this.currentKpi });
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.KPI.KPI_ADDED')
            });
        }

        this.applyFilters();
        this.updateDashboardData();
        this.kpiDialog = false;
    }

    deleteKpi(kpi: KpiRecord) {
        this.confirmationService.confirm({
            message: `${this.translate.instant('FINANCIAL_BLOCK.KPI.DELETE_CONFIRM')} "${kpi.name}"?`,
            header: this.translate.instant('COMMON.CONFIRM_DELETE'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('COMMON.YES'),
            rejectLabel: this.translate.instant('COMMON.NO'),
            accept: () => {
                this.kpis = this.kpis.filter(k => k.id !== kpi.id);
                this.applyFilters();
                this.updateDashboardData();
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant('FINANCIAL_BLOCK.KPI.KPI_DELETED')
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
            case 'achieved': return this.translate.instant('FINANCIAL_BLOCK.KPI.STATUS_ACHIEVED');
            case 'warning': return this.translate.instant('FINANCIAL_BLOCK.KPI.STATUS_WARNING');
            case 'critical': return this.translate.instant('FINANCIAL_BLOCK.KPI.STATUS_CRITICAL');
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
        const t = this.translate;
        const cols = 'FINANCIAL_BLOCK.KPI.EXPORT_COLUMNS';

        const data = this.filteredKpis.map(k => ({
            [t.instant(`${cols}.INDICATOR`)]: k.name,
            [t.instant(`${cols}.CATEGORY`)]: this.getCategoryLabel(k.category),
            [t.instant(`${cols}.DEPARTMENT`)]: this.getDepartmentLabel(k.department),
            [t.instant(`${cols}.PERIOD`)]: this.getPeriodLabel(k.period),
            [t.instant(`${cols}.UNIT`)]: this.getUnitLabel(k.unit),
            [t.instant(`${cols}.TARGET`)]: k.targetValue,
            [t.instant(`${cols}.ACTUAL`)]: k.actualValue,
            [t.instant(`${cols}.PERFORMANCE`)]: this.getAchievementPercent(k).toFixed(1),
            [t.instant(`${cols}.STATUS`)]: this.getStatusLabel(this.getKpiStatus(k)),
            [t.instant(`${cols}.WEIGHT`)]: k.weight,
            [t.instant(`${cols}.RESPONSIBLE`)]: k.responsiblePerson,
            [t.instant(`${cols}.NOTES`)]: k.notes
        }));

        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(';'),
            ...data.map(row => headers.map(h => (row as any)[h]).join(';'))
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
            summary: t.instant('COMMON.EXPORT'),
            detail: t.instant('COMMON.EXPORT_SUCCESS')
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
                label: this.translate.instant('FINANCIAL_BLOCK.KPI.CHART_KPI_PERFORMANCE'),
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
                    label: this.translate.instant('FINANCIAL_BLOCK.KPI.TARGET'),
                    data: targetData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: this.translate.instant('FINANCIAL_BLOCK.KPI.ACTUAL'),
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
        const months = [
            this.translate.instant('COMMON.MONTHS.JUL'),
            this.translate.instant('COMMON.MONTHS.AUG'),
            this.translate.instant('COMMON.MONTHS.SEP'),
            this.translate.instant('COMMON.MONTHS.OCT'),
            this.translate.instant('COMMON.MONTHS.NOV'),
            this.translate.instant('COMMON.MONTHS.DEC')
        ];
        // Simulated historical data
        const historicalData = [82, 85, 88, 86, 91, this.overallKpi];

        this.lineChartData = {
            labels: months,
            datasets: [{
                label: this.translate.instant('FINANCIAL_BLOCK.KPI.OVERALL_KPI'),
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
            labels: [
                this.translate.instant('FINANCIAL_BLOCK.KPI.STATUS_ACHIEVED'),
                this.translate.instant('FINANCIAL_BLOCK.KPI.STATUS_WARNING'),
                this.translate.instant('FINANCIAL_BLOCK.KPI.STATUS_CRITICAL')
            ],
            datasets: [{
                data: [achieved, warning, critical],
                backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
                hoverBackgroundColor: ['#16A34A', '#D97706', '#DC2626'],
                borderWidth: 0
            }]
        };
    }
}
