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
import { FinancialDashboardService } from '../dashboard/services/financial-dashboard.service';

interface RepairCategory {
    label: string;
    value: string;
    icon: string;
}

interface RepairType {
    label: string;
    value: string;
}

interface RepairRecord {
    id: number;
    date: Date;
    objectName: string;
    repairType: 'planned' | 'unplanned' | 'emergency';
    category: string;
    plannedCost: number;
    actualCost: number | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    contractor: string;
    description: string;
}

@Component({
    selector: 'app-repair-costs',
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
        TextareaModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './repair-costs.component.html',
    styleUrl: './repair-costs.component.scss'
})
export class RepairCostsComponent implements OnInit {
    repairs: RepairRecord[] = [];
    filteredRepairs: RepairRecord[] = [];

    // Dialog
    repairDialog: boolean = false;
    isEditMode: boolean = false;
    currentRepair: RepairRecord = this.getEmptyRepair();

    // Filters
    searchText: string = '';
    dateRange: Date[] = [];
    selectedCategory: string | null = null;
    selectedStatus: string | null = null;
    selectedRepairType: string | null = null;

    // Dropdown options
    categories: RepairCategory[] = [
        { label: 'Электрика', value: 'electrical', icon: 'pi pi-bolt' },
        { label: 'Механика', value: 'mechanical', icon: 'pi pi-cog' },
        { label: 'Строительство', value: 'construction', icon: 'pi pi-building' },
        { label: 'Сантехника', value: 'plumbing', icon: 'pi pi-filter' },
        { label: 'Кондиционирование', value: 'hvac', icon: 'pi pi-sun' },
        { label: 'IT оборудование', value: 'it', icon: 'pi pi-desktop' },
        { label: 'Прочее', value: 'other', icon: 'pi pi-ellipsis-h' }
    ];

    repairTypes: RepairType[] = [
        { label: 'Плановый', value: 'planned' },
        { label: 'Внеплановый', value: 'unplanned' },
        { label: 'Аварийный', value: 'emergency' }
    ];

    statuses = [
        { label: 'Запланирован', value: 'scheduled' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Завершён', value: 'completed' },
        { label: 'Отменён', value: 'cancelled' }
    ];

    // Charts
    categoryChartData: any;
    categoryChartOptions: any;
    monthlyChartData: any;
    monthlyChartOptions: any;
    plannedVsActualData: any;
    plannedVsActualOptions: any;

    private dashboardService = inject(FinancialDashboardService);

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadRepairs();
        this.applyFilters();
        this.initCharts();
        this.updateDashboardData();
    }

    private updateDashboardData(): void {
        const inProgressCount = this.repairs.filter(r => r.status === 'in_progress').length;
        const completedCount = this.repairs.filter(r => r.status === 'completed').length;
        this.dashboardService.updateRepairCosts({
            totalPlannedCost: this.totalPlannedCost,
            totalActualCost: this.totalActualCost,
            costDifference: this.costDifference,
            repairsCount: this.repairs.length,
            inProgressCount,
            completedCount
        });
    }

    loadRepairs() {
        this.repairs = [
            { id: 1, date: new Date(2024, 11, 1), objectName: 'Турбина №1', repairType: 'planned', category: 'mechanical', plannedCost: 5000000, actualCost: 4800000, status: 'completed', contractor: 'ТехСервис', description: 'Плановое ТО турбины' },
            { id: 2, date: new Date(2024, 11, 5), objectName: 'Трансформатор Т-2', repairType: 'emergency', category: 'electrical', plannedCost: 2500000, actualCost: 3200000, status: 'completed', contractor: 'ЭлектроМонтаж', description: 'Замена обмотки' },
            { id: 3, date: new Date(2024, 11, 10), objectName: 'Насосная станция', repairType: 'unplanned', category: 'plumbing', plannedCost: 800000, actualCost: 750000, status: 'completed', contractor: 'ГидроТех', description: 'Ремонт насосов' },
            { id: 4, date: new Date(2024, 11, 15), objectName: 'Генератор Г-3', repairType: 'planned', category: 'mechanical', plannedCost: 3500000, actualCost: null, status: 'in_progress', contractor: 'ТехСервис', description: 'Капитальный ремонт' },
            { id: 5, date: new Date(2024, 11, 18), objectName: 'Серверная комната', repairType: 'planned', category: 'hvac', plannedCost: 1200000, actualCost: null, status: 'scheduled', contractor: 'КлиматКонтроль', description: 'Замена кондиционеров' },
            { id: 6, date: new Date(2024, 11, 20), objectName: 'Административное здание', repairType: 'planned', category: 'construction', plannedCost: 4500000, actualCost: null, status: 'scheduled', contractor: 'СтройМастер', description: 'Ремонт кровли' },
            { id: 7, date: new Date(2024, 10, 25), objectName: 'ЛЭП-110кВ', repairType: 'emergency', category: 'electrical', plannedCost: 1800000, actualCost: 2100000, status: 'completed', contractor: 'ЭлектроМонтаж', description: 'Замена опоры' },
            { id: 8, date: new Date(2024, 10, 15), objectName: 'Котельная', repairType: 'planned', category: 'mechanical', plannedCost: 2200000, actualCost: 2150000, status: 'completed', contractor: 'ТеплоСервис', description: 'Замена горелок' }
        ];
    }

    // Computed totals
    get totalPlannedCost(): number {
        return this.filteredRepairs
            .filter(r => r.status !== 'cancelled')
            .reduce((sum, r) => sum + r.plannedCost, 0);
    }

    get totalActualCost(): number {
        return this.filteredRepairs
            .filter(r => r.status !== 'cancelled' && r.actualCost !== null)
            .reduce((sum, r) => sum + (r.actualCost || 0), 0);
    }

    get completedRepairs(): RepairRecord[] {
        return this.filteredRepairs.filter(r => r.status === 'completed' && r.actualCost !== null);
    }

    get costDifference(): number {
        const completedPlanned = this.completedRepairs.reduce((sum, r) => sum + r.plannedCost, 0);
        const completedActual = this.completedRepairs.reduce((sum, r) => sum + (r.actualCost || 0), 0);
        return completedPlanned - completedActual;
    }

    get totalRepairsCount(): number {
        return this.filteredRepairs.filter(r => r.status !== 'cancelled').length;
    }

    // Filters
    applyFilters() {
        let result = [...this.repairs];

        // Search filter
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            result = result.filter(r =>
                r.objectName.toLowerCase().includes(search) ||
                r.contractor.toLowerCase().includes(search) ||
                r.description.toLowerCase().includes(search)
            );
        }

        // Date range filter
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            result = result.filter(r =>
                r.date >= this.dateRange[0] && r.date <= this.dateRange[1]
            );
        }

        // Category filter
        if (this.selectedCategory) {
            result = result.filter(r => r.category === this.selectedCategory);
        }

        // Status filter
        if (this.selectedStatus) {
            result = result.filter(r => r.status === this.selectedStatus);
        }

        // Repair type filter
        if (this.selectedRepairType) {
            result = result.filter(r => r.repairType === this.selectedRepairType);
        }

        // Sort by date descending
        result.sort((a, b) => b.date.getTime() - a.date.getTime());

        this.filteredRepairs = result;

        // Update charts only if they are initialized
        if (this.monthlyChartData) {
            this.updateCharts();
        }
    }

    clearFilters() {
        this.searchText = '';
        this.dateRange = [];
        this.selectedCategory = null;
        this.selectedStatus = null;
        this.selectedRepairType = null;
        this.applyFilters();
    }

    // CRUD Operations
    getEmptyRepair(): RepairRecord {
        return {
            id: 0,
            date: new Date(),
            objectName: '',
            repairType: 'planned',
            category: 'mechanical',
            plannedCost: 0,
            actualCost: null,
            status: 'scheduled',
            contractor: '',
            description: ''
        };
    }

    openNewRepair() {
        this.currentRepair = this.getEmptyRepair();
        this.isEditMode = false;
        this.repairDialog = true;
    }

    editRepair(repair: RepairRecord) {
        this.currentRepair = { ...repair };
        this.isEditMode = true;
        this.repairDialog = true;
    }

    saveRepair() {
        if (!this.currentRepair.objectName || !this.currentRepair.contractor) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Заполните обязательные поля'
            });
            return;
        }

        if (!this.currentRepair.plannedCost || this.currentRepair.plannedCost <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Укажите плановую стоимость'
            });
            return;
        }

        if (this.isEditMode) {
            const index = this.repairs.findIndex(r => r.id === this.currentRepair.id);
            if (index !== -1) {
                this.repairs[index] = { ...this.currentRepair };
            }
            this.messageService.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Запись обновлена'
            });
        } else {
            this.currentRepair.id = Math.max(...this.repairs.map(r => r.id), 0) + 1;
            this.repairs.push({ ...this.currentRepair });
            this.messageService.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Запись добавлена'
            });
        }

        this.applyFilters();
        this.updateDashboardData();
        this.repairDialog = false;
    }

    deleteRepair(repair: RepairRecord) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить запись "${repair.objectName}"?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Да',
            rejectLabel: 'Нет',
            accept: () => {
                this.repairs = this.repairs.filter(r => r.id !== repair.id);
                this.applyFilters();
                this.updateDashboardData();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Успешно',
                    detail: 'Запись удалена'
                });
            }
        });
    }

    // Helpers
    getCategoryLabel(value: string): string {
        return this.categories.find(c => c.value === value)?.label || value;
    }

    getCategoryIcon(value: string): string {
        return this.categories.find(c => c.value === value)?.icon || 'pi pi-wrench';
    }

    getRepairTypeLabel(value: string): string {
        return this.repairTypes.find(t => t.value === value)?.label || value;
    }

    getRepairTypeSeverity(type: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (type) {
            case 'planned': return 'success';
            case 'unplanned': return 'warn';
            case 'emergency': return 'danger';
            default: return 'info';
        }
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            case 'scheduled': return 'warn';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        return this.statuses.find(s => s.value === status)?.label || status;
    }

    formatCurrency(value: number | null): string {
        if (value === null) return '-';
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value) + ' UZS';
    }

    getCostVariance(repair: RepairRecord): number | null {
        if (repair.actualCost === null) return null;
        return repair.plannedCost - repair.actualCost;
    }

    getCostVarianceClass(repair: RepairRecord): string {
        const variance = this.getCostVariance(repair);
        if (variance === null) return '';
        return variance >= 0 ? 'text-green-600' : 'text-red-600';
    }

    // Export to Excel
    exportToExcel() {
        const data = this.filteredRepairs.map(r => ({
            'Дата': new Date(r.date).toLocaleDateString('ru-RU'),
            'Объект': r.objectName,
            'Тип ремонта': this.getRepairTypeLabel(r.repairType),
            'Категория': this.getCategoryLabel(r.category),
            'Плановая стоимость': r.plannedCost,
            'Фактическая стоимость': r.actualCost || '',
            'Разница': this.getCostVariance(r) || '',
            'Подрядчик': r.contractor,
            'Статус': this.getStatusLabel(r.status),
            'Описание': r.description
        }));

        // Add totals row
        data.push({
            'Дата': '',
            'Объект': 'ИТОГО',
            'Тип ремонта': '',
            'Категория': '',
            'Плановая стоимость': this.totalPlannedCost,
            'Фактическая стоимость': this.totalActualCost,
            'Разница': this.costDifference,
            'Подрядчик': '',
            'Статус': '',
            'Описание': ''
        });

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
        link.setAttribute('download', `repair-costs-${new Date().toISOString().split('T')[0]}.csv`);
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

        // Category Pie Chart Options
        this.categoryChartOptions = {
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 12,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw || 0;
                            return ` ${context.label}: ${this.formatCurrency(value)}`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Monthly Bar Chart Options
        this.monthlyChartOptions = {
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw || 0;
                            return ` ${context.dataset.label}: ${this.formatCurrency(value)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        callback: (value: number) => this.formatCurrency(value)
                    },
                    grid: { color: surfaceBorder }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Planned vs Actual Doughnut Chart Options
        this.plannedVsActualOptions = {
            cutout: '55%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 12,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw || 0;
                            return ` ${context.label}: ${this.formatCurrency(value)}`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateMonthlyChart();
        this.updatePlannedVsActualChart();
    }

    updateCategoryChart() {
        const categoryTotals: { [key: string]: number } = {};

        // Calculate totals by category
        this.filteredRepairs
            .filter(r => r.status !== 'cancelled')
            .forEach(r => {
                const category = r.category;
                const cost = r.actualCost !== null ? r.actualCost : r.plannedCost;
                categoryTotals[category] = (categoryTotals[category] || 0) + cost;
            });

        const labels = Object.keys(categoryTotals).map(key => this.getCategoryLabel(key));
        const data = Object.values(categoryTotals);

        const colors = [
            '#3B82F6', '#22C55E', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#6B7280'
        ];

        this.categoryChartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                hoverBackgroundColor: colors.slice(0, data.length).map(c => c + 'CC')
            }]
        };
    }

    updateMonthlyChart() {
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const plannedByMonth: number[] = new Array(12).fill(0);
        const actualByMonth: number[] = new Array(12).fill(0);

        this.repairs
            .filter(r => r.status !== 'cancelled')
            .forEach(r => {
                const month = r.date.getMonth();
                plannedByMonth[month] += r.plannedCost;
                if (r.actualCost !== null) {
                    actualByMonth[month] += r.actualCost;
                }
            });

        this.monthlyChartData = {
            labels: months,
            datasets: [
                {
                    label: 'Плановые затраты',
                    data: plannedByMonth,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Фактические затраты',
                    data: actualByMonth,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22C55E',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        };
    }

    updatePlannedVsActualChart() {
        const completedPlanned = this.completedRepairs.reduce((sum, r) => sum + r.plannedCost, 0);
        const completedActual = this.completedRepairs.reduce((sum, r) => sum + (r.actualCost || 0), 0);

        this.plannedVsActualData = {
            labels: ['Плановые', 'Фактические'],
            datasets: [{
                data: [completedPlanned, completedActual],
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)'],
                hoverBackgroundColor: ['#3B82F6', '#22C55E'],
                borderWidth: 0
            }]
        };
    }
}
