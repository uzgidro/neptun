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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ProcurementCategory {
    label: string;
    value: string;
    icon: string;
}

interface ProcurementStatus {
    label: string;
    value: string;
}

interface ProcurementPriority {
    label: string;
    value: string;
}

interface ProcurementUnit {
    label: string;
    value: string;
}

interface ProcurementRecord {
    id: number;
    requestNumber: string;
    requestDate: Date;
    itemName: string;
    category: string;
    supplier: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalAmount: number;
    department: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'request' | 'approval' | 'approved' | 'purchasing' | 'delivered' | 'cancelled';
    plannedDeliveryDate: Date | null;
    actualDeliveryDate: Date | null;
    responsiblePerson: string;
    notes: string;
}

@Component({
    selector: 'app-procurement',
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
        TranslateModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './procurement.component.html',
    styleUrl: './procurement.component.scss'
})
export class ProcurementComponent implements OnInit {
    procurements: ProcurementRecord[] = [];
    filteredProcurements: ProcurementRecord[] = [];

    // Dialog
    procurementDialog: boolean = false;
    isEditMode: boolean = false;
    currentProcurement: ProcurementRecord = this.getEmptyProcurement();

    // Filters
    searchText: string = '';
    dateRange: Date[] = [];
    selectedCategory: string | null = null;
    selectedStatus: string | null = null;
    selectedPriority: string | null = null;
    selectedDepartment: string | null = null;

    // Dropdown options - initialized in initTranslations()
    categories: ProcurementCategory[] = [];
    statuses: ProcurementStatus[] = [];
    priorities: ProcurementPriority[] = [];
    units: ProcurementUnit[] = [];
    departments: { label: string; value: string }[] = [];

    // Charts
    categoryChartData: any;
    categoryChartOptions: any;
    monthlyChartData: any;
    monthlyChartOptions: any;
    statusChartData: any;
    statusChartOptions: any;
    supplierChartData: any;
    supplierChartOptions: any;

    private dashboardService = inject(FinancialDashboardService);
    private translate = inject(TranslateService);

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.initTranslations();
        this.loadProcurements();
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
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_EQUIPMENT'), value: 'equipment', icon: 'pi pi-cog' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_MATERIALS'), value: 'materials', icon: 'pi pi-box' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_SPARE_PARTS'), value: 'spare_parts', icon: 'pi pi-wrench' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_SERVICES'), value: 'services', icon: 'pi pi-briefcase' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_IT'), value: 'it', icon: 'pi pi-desktop' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_OFFICE'), value: 'office', icon: 'pi pi-pencil' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.CATEGORY_OTHER'), value: 'other', icon: 'pi pi-ellipsis-h' }
        ];

        this.statuses = [
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.STATUS_REQUEST'), value: 'request' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.STATUS_APPROVAL'), value: 'approval' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.STATUS_APPROVED'), value: 'approved' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.STATUS_PURCHASING'), value: 'purchasing' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.STATUS_DELIVERED'), value: 'delivered' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.STATUS_CANCELLED'), value: 'cancelled' }
        ];

        this.priorities = [
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.PRIORITY_LOW'), value: 'low' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.PRIORITY_MEDIUM'), value: 'medium' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.PRIORITY_HIGH'), value: 'high' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.PRIORITY_URGENT'), value: 'urgent' }
        ];

        this.units = [
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.UNIT_PCS'), value: 'pcs' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.UNIT_KG'), value: 'kg' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.UNIT_M'), value: 'm' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.UNIT_L'), value: 'l' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.UNIT_SET'), value: 'set' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.UNIT_PACK'), value: 'pack' }
        ];

        this.departments = [
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.DEPT_PRODUCTION'), value: 'production' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.DEPT_TECHNICAL'), value: 'technical' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.DEPT_ADMIN'), value: 'admin' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.DEPT_IT'), value: 'it' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.DEPT_ACCOUNTING'), value: 'accounting' },
            { label: t.instant('FINANCIAL_BLOCK.PROCUREMENT.DEPT_HR'), value: 'hr' }
        ];
    }

    private updateDashboardData(): void {
        this.dashboardService.updateProcurement({
            totalAmount: this.totalAmount,
            procurementsCount: this.totalProcurementsCount,
            pendingCount: this.pendingCount,
            inProgressCount: this.inProgressCount,
            deliveredCount: this.deliveredCount,
            deliveredAmount: this.deliveredAmount
        });
    }

    loadProcurements() {
        this.procurements = [
            { id: 1, requestNumber: 'ZAK-2024-001', requestDate: new Date(2024, 11, 1), itemName: 'Трансформатор силовой ТМ-400', category: 'equipment', supplier: 'ЭлектроСнаб', quantity: 2, unit: 'pcs', unitPrice: 15000000, totalAmount: 30000000, department: 'technical', priority: 'high', status: 'delivered', plannedDeliveryDate: new Date(2024, 11, 15), actualDeliveryDate: new Date(2024, 11, 14), responsiblePerson: 'Иванов И.И.', notes: 'Для подстанции №3' },
            { id: 2, requestNumber: 'ZAK-2024-002', requestDate: new Date(2024, 11, 3), itemName: 'Кабель силовой ВВГнг 4x16', category: 'materials', supplier: 'КабельОпт', quantity: 500, unit: 'm', unitPrice: 45000, totalAmount: 22500000, department: 'technical', priority: 'medium', status: 'purchasing', plannedDeliveryDate: new Date(2024, 11, 20), actualDeliveryDate: null, responsiblePerson: 'Петров П.П.', notes: '' },
            { id: 3, requestNumber: 'ZAK-2024-003', requestDate: new Date(2024, 11, 5), itemName: 'Подшипники SKF 6310', category: 'spare_parts', supplier: 'ТехноДеталь', quantity: 20, unit: 'pcs', unitPrice: 850000, totalAmount: 17000000, department: 'production', priority: 'urgent', status: 'approved', plannedDeliveryDate: new Date(2024, 11, 10), actualDeliveryDate: null, responsiblePerson: 'Сидоров С.С.', notes: 'Срочная замена на турбине №2' },
            { id: 4, requestNumber: 'ZAK-2024-004', requestDate: new Date(2024, 11, 7), itemName: 'Сервер Dell PowerEdge R750', category: 'it', supplier: 'IT Solutions', quantity: 1, unit: 'pcs', unitPrice: 45000000, totalAmount: 45000000, department: 'it', priority: 'high', status: 'approval', plannedDeliveryDate: new Date(2024, 11, 25), actualDeliveryDate: null, responsiblePerson: 'Козлов К.К.', notes: 'Для серверной комнаты' },
            { id: 5, requestNumber: 'ZAK-2024-005', requestDate: new Date(2024, 11, 8), itemName: 'Масло турбинное Т-22', category: 'materials', supplier: 'НефтеХим', quantity: 200, unit: 'l', unitPrice: 120000, totalAmount: 24000000, department: 'production', priority: 'medium', status: 'delivered', plannedDeliveryDate: new Date(2024, 11, 12), actualDeliveryDate: new Date(2024, 11, 11), responsiblePerson: 'Иванов И.И.', notes: '' },
            { id: 6, requestNumber: 'ZAK-2024-006', requestDate: new Date(2024, 11, 10), itemName: 'Канцтовары (комплект)', category: 'office', supplier: 'ОфисМаг', quantity: 10, unit: 'set', unitPrice: 500000, totalAmount: 5000000, department: 'admin', priority: 'low', status: 'request', plannedDeliveryDate: new Date(2024, 11, 30), actualDeliveryDate: null, responsiblePerson: 'Новикова Н.Н.', notes: 'Квартальный заказ' },
            { id: 7, requestNumber: 'ZAK-2024-007', requestDate: new Date(2024, 11, 12), itemName: 'Услуги по ТО кондиционеров', category: 'services', supplier: 'КлиматСервис', quantity: 1, unit: 'set', unitPrice: 8000000, totalAmount: 8000000, department: 'admin', priority: 'medium', status: 'purchasing', plannedDeliveryDate: new Date(2024, 11, 18), actualDeliveryDate: null, responsiblePerson: 'Петров П.П.', notes: 'Годовое обслуживание' },
            { id: 8, requestNumber: 'ZAK-2024-008', requestDate: new Date(2024, 11, 14), itemName: 'Насос центробежный КМ 80-50', category: 'equipment', supplier: 'НасосТорг', quantity: 1, unit: 'pcs', unitPrice: 12000000, totalAmount: 12000000, department: 'technical', priority: 'high', status: 'approved', plannedDeliveryDate: new Date(2024, 11, 22), actualDeliveryDate: null, responsiblePerson: 'Сидоров С.С.', notes: 'Резервный насос' },
            { id: 9, requestNumber: 'ZAK-2024-009', requestDate: new Date(2024, 10, 20), itemName: 'Генератор дизельный 100кВт', category: 'equipment', supplier: 'ЭнергоМаш', quantity: 1, unit: 'pcs', unitPrice: 85000000, totalAmount: 85000000, department: 'technical', priority: 'high', status: 'delivered', plannedDeliveryDate: new Date(2024, 11, 1), actualDeliveryDate: new Date(2024, 10, 30), responsiblePerson: 'Иванов И.И.', notes: 'Аварийное электроснабжение' },
            { id: 10, requestNumber: 'ZAK-2024-010', requestDate: new Date(2024, 10, 25), itemName: 'Спецодежда (комплект)', category: 'other', supplier: 'СпецОдежда', quantity: 50, unit: 'set', unitPrice: 350000, totalAmount: 17500000, department: 'hr', priority: 'medium', status: 'delivered', plannedDeliveryDate: new Date(2024, 11, 5), actualDeliveryDate: new Date(2024, 11, 4), responsiblePerson: 'Новикова Н.Н.', notes: 'Зимняя спецодежда' }
        ];
    }

    // Computed totals
    get totalProcurementsCount(): number {
        return this.filteredProcurements.filter(p => p.status !== 'cancelled').length;
    }

    get totalAmount(): number {
        return this.filteredProcurements
            .filter(p => p.status !== 'cancelled')
            .reduce((sum, p) => sum + p.totalAmount, 0);
    }

    get pendingCount(): number {
        return this.filteredProcurements.filter(p => p.status === 'request' || p.status === 'approval').length;
    }

    get inProgressCount(): number {
        return this.filteredProcurements.filter(p => p.status === 'approved' || p.status === 'purchasing').length;
    }

    get deliveredCount(): number {
        return this.filteredProcurements.filter(p => p.status === 'delivered').length;
    }

    get deliveredAmount(): number {
        return this.filteredProcurements
            .filter(p => p.status === 'delivered')
            .reduce((sum, p) => sum + p.totalAmount, 0);
    }

    // Filters
    applyFilters() {
        let result = [...this.procurements];

        // Search filter
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            result = result.filter(p =>
                p.itemName.toLowerCase().includes(search) ||
                p.supplier.toLowerCase().includes(search) ||
                p.requestNumber.toLowerCase().includes(search) ||
                p.responsiblePerson.toLowerCase().includes(search)
            );
        }

        // Date range filter
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            result = result.filter(p =>
                p.requestDate >= this.dateRange[0] && p.requestDate <= this.dateRange[1]
            );
        }

        // Category filter
        if (this.selectedCategory) {
            result = result.filter(p => p.category === this.selectedCategory);
        }

        // Status filter
        if (this.selectedStatus) {
            result = result.filter(p => p.status === this.selectedStatus);
        }

        // Priority filter
        if (this.selectedPriority) {
            result = result.filter(p => p.priority === this.selectedPriority);
        }

        // Department filter
        if (this.selectedDepartment) {
            result = result.filter(p => p.department === this.selectedDepartment);
        }

        // Sort by date descending
        result.sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());

        this.filteredProcurements = result;

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
        this.selectedPriority = null;
        this.selectedDepartment = null;
        this.applyFilters();
    }

    // CRUD Operations
    getEmptyProcurement(): ProcurementRecord {
        return {
            id: 0,
            requestNumber: '',
            requestDate: new Date(),
            itemName: '',
            category: 'materials',
            supplier: '',
            quantity: 1,
            unit: 'pcs',
            unitPrice: 0,
            totalAmount: 0,
            department: 'technical',
            priority: 'medium',
            status: 'request',
            plannedDeliveryDate: null,
            actualDeliveryDate: null,
            responsiblePerson: '',
            notes: ''
        };
    }

    generateRequestNumber(): string {
        const year = new Date().getFullYear();
        const maxNum = Math.max(...this.procurements.map(p => {
            const match = p.requestNumber.match(/ZAK-\d{4}-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }), 0);
        return `ZAK-${year}-${String(maxNum + 1).padStart(3, '0')}`;
    }

    openNewProcurement() {
        this.currentProcurement = this.getEmptyProcurement();
        this.currentProcurement.requestNumber = this.generateRequestNumber();
        this.isEditMode = false;
        this.procurementDialog = true;
    }

    editProcurement(procurement: ProcurementRecord) {
        this.currentProcurement = { ...procurement };
        this.isEditMode = true;
        this.procurementDialog = true;
    }

    calculateTotal() {
        this.currentProcurement.totalAmount = this.currentProcurement.quantity * this.currentProcurement.unitPrice;
    }

    saveProcurement() {
        if (!this.currentProcurement.itemName || !this.currentProcurement.supplier) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.FILL_REQUIRED')
            });
            return;
        }

        if (!this.currentProcurement.unitPrice || this.currentProcurement.unitPrice <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.SPECIFY_PRICE')
            });
            return;
        }

        // Recalculate total
        this.calculateTotal();

        if (this.isEditMode) {
            const index = this.procurements.findIndex(p => p.id === this.currentProcurement.id);
            if (index !== -1) {
                this.procurements[index] = { ...this.currentProcurement };
            }
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.PROCUREMENT_UPDATED')
            });
        } else {
            this.currentProcurement.id = Math.max(...this.procurements.map(p => p.id), 0) + 1;
            this.procurements.push({ ...this.currentProcurement });
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.PROCUREMENT_ADDED')
            });
        }

        this.applyFilters();
        this.updateDashboardData();
        this.procurementDialog = false;
    }

    deleteProcurement(procurement: ProcurementRecord) {
        this.confirmationService.confirm({
            message: `${this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.DELETE_CONFIRM')} "${procurement.requestNumber}"?`,
            header: this.translate.instant('COMMON.CONFIRM_DELETE'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('COMMON.YES'),
            rejectLabel: this.translate.instant('COMMON.NO'),
            accept: () => {
                this.procurements = this.procurements.filter(p => p.id !== procurement.id);
                this.updateDashboardData();
                this.applyFilters();
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.PROCUREMENT_DELETED')
                });
            }
        });
    }

    // Helpers
    getCategoryLabel(value: string): string {
        return this.categories.find(c => c.value === value)?.label || value;
    }

    getCategoryIcon(value: string): string {
        return this.categories.find(c => c.value === value)?.icon || 'pi pi-box';
    }

    getStatusLabel(value: string): string {
        return this.statuses.find(s => s.value === value)?.label || value;
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'delivered': return 'success';
            case 'approved':
            case 'purchasing': return 'info';
            case 'request':
            case 'approval': return 'warn';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getPriorityLabel(value: string): string {
        return this.priorities.find(p => p.value === value)?.label || value;
    }

    getPrioritySeverity(priority: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (priority) {
            case 'low': return 'secondary';
            case 'medium': return 'info';
            case 'high': return 'warn';
            case 'urgent': return 'danger';
            default: return 'secondary';
        }
    }

    getDepartmentLabel(value: string): string {
        return this.departments.find(d => d.value === value)?.label || value;
    }

    getUnitLabel(value: string): string {
        return this.units.find(u => u.value === value)?.label || value;
    }

    formatCurrency(value: number | null): string {
        if (value === null) return '-';
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value) + ' UZS';
    }

    isOverdue(procurement: ProcurementRecord): boolean {
        if (procurement.status === 'delivered' || procurement.status === 'cancelled') return false;
        if (!procurement.plannedDeliveryDate) return false;
        return new Date() > procurement.plannedDeliveryDate;
    }

    // Export to Excel
    exportToExcel() {
        const t = this.translate;
        const cols = 'FINANCIAL_BLOCK.PROCUREMENT.EXPORT_COLUMNS';

        const data = this.filteredProcurements.map(p => ({
            [t.instant(`${cols}.REQUEST_NUMBER`)]: p.requestNumber,
            [t.instant(`${cols}.REQUEST_DATE`)]: new Date(p.requestDate).toLocaleDateString('ru-RU'),
            [t.instant(`${cols}.ITEM_NAME`)]: p.itemName,
            [t.instant(`${cols}.CATEGORY`)]: this.getCategoryLabel(p.category),
            [t.instant(`${cols}.SUPPLIER`)]: p.supplier,
            [t.instant(`${cols}.QUANTITY`)]: p.quantity,
            [t.instant(`${cols}.UNIT`)]: this.getUnitLabel(p.unit),
            [t.instant(`${cols}.UNIT_PRICE`)]: p.unitPrice,
            [t.instant(`${cols}.TOTAL`)]: p.totalAmount,
            [t.instant(`${cols}.DEPARTMENT`)]: this.getDepartmentLabel(p.department),
            [t.instant(`${cols}.PRIORITY`)]: this.getPriorityLabel(p.priority),
            [t.instant(`${cols}.STATUS`)]: this.getStatusLabel(p.status),
            [t.instant(`${cols}.PLANNED_DATE`)]: p.plannedDeliveryDate ? new Date(p.plannedDeliveryDate).toLocaleDateString('ru-RU') : '',
            [t.instant(`${cols}.ACTUAL_DATE`)]: p.actualDeliveryDate ? new Date(p.actualDeliveryDate).toLocaleDateString('ru-RU') : '',
            [t.instant(`${cols}.RESPONSIBLE`)]: p.responsiblePerson,
            [t.instant(`${cols}.NOTES`)]: p.notes
        }));

        // Add totals row
        data.push({
            [t.instant(`${cols}.REQUEST_NUMBER`)]: '',
            [t.instant(`${cols}.REQUEST_DATE`)]: '',
            [t.instant(`${cols}.ITEM_NAME`)]: t.instant(`${cols}.TOTAL_ROW`),
            [t.instant(`${cols}.CATEGORY`)]: '',
            [t.instant(`${cols}.SUPPLIER`)]: '',
            [t.instant(`${cols}.QUANTITY`)]: '' as any,
            [t.instant(`${cols}.UNIT`)]: '',
            [t.instant(`${cols}.UNIT_PRICE`)]: '' as any,
            [t.instant(`${cols}.TOTAL`)]: this.totalAmount,
            [t.instant(`${cols}.DEPARTMENT`)]: '',
            [t.instant(`${cols}.PRIORITY`)]: '',
            [t.instant(`${cols}.STATUS`)]: '',
            [t.instant(`${cols}.PLANNED_DATE`)]: '',
            [t.instant(`${cols}.ACTUAL_DATE`)]: '',
            [t.instant(`${cols}.RESPONSIBLE`)]: '',
            [t.instant(`${cols}.NOTES`)]: ''
        });

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
        link.setAttribute('download', `procurement-${new Date().toISOString().split('T')[0]}.csv`);
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

        // Status Doughnut Chart Options
        this.statusChartOptions = {
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
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Supplier Horizontal Bar Chart Options
        this.supplierChartOptions = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw || 0;
                            return ` ${this.formatCurrency(value)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        callback: (value: number) => this.formatCurrency(value)
                    },
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
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateMonthlyChart();
        this.updateStatusChart();
        this.updateSupplierChart();
    }

    updateCategoryChart() {
        const categoryTotals: { [key: string]: number } = {};

        this.filteredProcurements
            .filter(p => p.status !== 'cancelled')
            .forEach(p => {
                categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.totalAmount;
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
        const months = [
            this.translate.instant('COMMON.MONTHS.JAN'),
            this.translate.instant('COMMON.MONTHS.FEB'),
            this.translate.instant('COMMON.MONTHS.MAR'),
            this.translate.instant('COMMON.MONTHS.APR'),
            this.translate.instant('COMMON.MONTHS.MAY'),
            this.translate.instant('COMMON.MONTHS.JUN'),
            this.translate.instant('COMMON.MONTHS.JUL'),
            this.translate.instant('COMMON.MONTHS.AUG'),
            this.translate.instant('COMMON.MONTHS.SEP'),
            this.translate.instant('COMMON.MONTHS.OCT'),
            this.translate.instant('COMMON.MONTHS.NOV'),
            this.translate.instant('COMMON.MONTHS.DEC')
        ];
        const requestedByMonth: number[] = new Array(12).fill(0);
        const deliveredByMonth: number[] = new Array(12).fill(0);

        this.procurements
            .filter(p => p.status !== 'cancelled')
            .forEach(p => {
                const requestMonth = p.requestDate.getMonth();
                requestedByMonth[requestMonth] += p.totalAmount;

                if (p.status === 'delivered' && p.actualDeliveryDate) {
                    const deliveryMonth = p.actualDeliveryDate.getMonth();
                    deliveredByMonth[deliveryMonth] += p.totalAmount;
                }
            });

        this.monthlyChartData = {
            labels: months,
            datasets: [
                {
                    label: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.CHART_REQUESTS'),
                    data: requestedByMonth,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: this.translate.instant('FINANCIAL_BLOCK.PROCUREMENT.CHART_DELIVERED'),
                    data: deliveredByMonth,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22C55E',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        };
    }

    updateStatusChart() {
        const statusCounts: { [key: string]: number } = {};

        this.filteredProcurements.forEach(p => {
            statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        });

        const statusOrder = ['request', 'approval', 'approved', 'purchasing', 'delivered', 'cancelled'];
        const labels: string[] = [];
        const data: number[] = [];

        statusOrder.forEach(status => {
            if (statusCounts[status]) {
                labels.push(this.getStatusLabel(status));
                data.push(statusCounts[status]);
            }
        });

        const colors = ['#F59E0B', '#FBBF24', '#3B82F6', '#60A5FA', '#22C55E', '#EF4444'];

        this.statusChartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                hoverBackgroundColor: colors.slice(0, data.length).map(c => c + 'CC'),
                borderWidth: 0
            }]
        };
    }

    updateSupplierChart() {
        const supplierTotals: { [key: string]: number } = {};

        this.filteredProcurements
            .filter(p => p.status !== 'cancelled')
            .forEach(p => {
                supplierTotals[p.supplier] = (supplierTotals[p.supplier] || 0) + p.totalAmount;
            });

        // Sort by amount and take top 5
        const sorted = Object.entries(supplierTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const labels = sorted.map(([supplier]) => supplier);
        const data = sorted.map(([, amount]) => amount);

        this.supplierChartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3B82F6',
                borderWidth: 1,
                borderRadius: 4
            }]
        };
    }
}
