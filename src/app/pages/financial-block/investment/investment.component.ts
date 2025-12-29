import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DatePicker } from 'primeng/datepicker';
import { FinancialDashboardService } from '../dashboard/services/financial-dashboard.service';

type Status = 'Новый' | 'В разработке' | 'Выполнено';
type OperationFilter = 'Все' | 'Кредит' | 'Дебит';
type Priority = 'Высокий' | 'Средний' | 'Низкий';

interface FileData {
    id: number;
    file_name: string;
    size_bytes: number;
    url: string;
    file?: File;
}

interface InvestmentData {
    id: number;
    project_name: string;
    status: Status;
    operation_type: 'Кредит' | 'Дебит';
    amount: number;
    priority: Priority;
    date: Date;
    comment: string;
    files?: FileData[];
}

@Component({
    selector: 'app-investment',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ChartModule,
        SelectComponent,
        Button,
        DatePickerComponent,
        DialogComponent,
        PrimeTemplate,
        ReactiveFormsModule,
        TextareaComponent,
        InputNumberdComponent,
        TooltipModule,
        FileUploadComponent,
        FileViewerComponent,
        FileListComponent,
        InputTextComponent,
        FormsModule,
        DatePicker
    ],
    templateUrl: './investment.component.html',
    styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
    investments: InvestmentData[] = [];
    filteredInvestments: InvestmentData[] = [];
    selectedOperation: { name: string; value: string } | undefined;

    chartData: any;
    chartOptions: any;
    lineChartData: any;
    lineChartOptions: any;

    // Dialog
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentInvestmentId: number | null = null;
    form!: FormGroup;

    // Files
    selectedFiles: File[] = [];
    currentInvestment: InvestmentData | null = null;
    showFilesDialog: boolean = false;
    selectedInvestmentForFiles: InvestmentData | null = null;
    existingFilesToKeep: number[] = [];

    // Date range filter
    dateRange: Date[] | null = null;

    private fb: FormBuilder = inject(FormBuilder);
    private messageService: MessageService = inject(MessageService);
    private dashboardService = inject(FinancialDashboardService);

    operationOptions = [
        { name: 'Все', value: 'Все' },
        { name: 'Кредит', value: 'Кредит' },
        { name: 'Дебит', value: 'Дебит' }
    ];

    statusOptions = [
        { name: 'Новый', value: 'Новый' },
        { name: 'В разработке', value: 'В разработке' },
        { name: 'Выполнено', value: 'Выполнено' }
    ];

    priorityOptions = [
        { name: 'Высокий', value: 'Высокий' },
        { name: 'Средний', value: 'Средний' },
        { name: 'Низкий', value: 'Низкий' }
    ];

    operationTypeOptions = [
        { name: 'Дебит', value: 'Дебит' },
        { name: 'Кредит', value: 'Кредит' }
    ];

    ngOnInit(): void {
        this.selectedOperation = this.operationOptions[0];

        // Initialize form
        this.form = this.fb.group({
            project_name: this.fb.control<string | null>(null),
            status: this.fb.control<{ name: string; value: Status } | null>(null),
            operation_type: this.fb.control<{ name: string; value: 'Дебит' | 'Кредит' } | null>(null),
            amount: this.fb.control<number | null>(null),
            priority: this.fb.control<{ name: string; value: Priority } | null>(null),
            date: this.fb.control<Date | null>(null),
            comment: this.fb.control<string | null>(null)
        });

        this.investments = [];

        this.initChartOptions();
        this.applyFilter();
        this.updateDashboardData();
    }

    private updateDashboardData(): void {
        const inProgressCount = this.investments.filter(i => i.status === 'В разработке').length;
        const completedCount = this.investments.filter(i => i.status === 'Выполнено').length;
        this.dashboardService.updateInvestment({
            totalDebit: this.totalDebit,
            totalCredit: this.totalCredit,
            balance: this.balance,
            projectsCount: this.investments.length,
            inProgressCount,
            completedCount
        });
    }

    private initChartOptions(): void {
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('ru-RU', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value) + ' UZS';
        };

        this.chartOptions = {
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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 800,
                easing: 'easeOutQuart'
            },
            cutout: '60%',
            onClick: (event: any, elements: any[]) => this.onDoughnutClick(event, elements)
        };

        this.lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: (tooltipItems: any[]) => {
                            const date = tooltipItems[0]?.label;
                            if (date) {
                                return new Date(date).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                            }
                            return date;
                        },
                        label: (context: any) => {
                            const value = context.raw || 0;
                            return ` ${context.dataset.label}: ${formatCurrency(value)}`;
                        },
                        footer: (tooltipItems: any[]) => {
                            const debit = tooltipItems.find(i => i.dataset.label === 'Дебит')?.raw || 0;
                            const credit = tooltipItems.find(i => i.dataset.label === 'Кредит')?.raw || 0;
                            const balance = debit - credit;
                            return `─────────────\nБаланс: ${formatCurrency(balance)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        callback: function(value: any, index: number) {
                            const label = (this as any).getLabelForValue(value);
                            return new Date(label).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value: any) => formatCurrency(value)
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            onClick: (event: any, elements: any[]) => this.onLineChartClick(event, elements)
        };
    }

    applyFilter(): void {
        if (!this.selectedOperation) this.selectedOperation = this.operationOptions[0];
        const filterValue = this.selectedOperation.value;

        // Filter by operation type
        let filtered = filterValue === 'Все' ? [...this.investments] : this.investments.filter((i) => i.operation_type === filterValue);

        // Filter by date range
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            const startDate = new Date(this.dateRange[0]);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(this.dateRange[1]);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter((i) => {
                const itemDate = new Date(i.date);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        this.filteredInvestments = filtered;

        this.updateChart();
        this.updateLineChart();
    }

    onDateRangeChange(): void {
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            this.applyFilter();
            const startFormatted = this.dateRange[0].toLocaleDateString('ru-RU');
            const endFormatted = this.dateRange[1].toLocaleDateString('ru-RU');
            this.messageService.add({
                severity: 'info',
                summary: 'Диапазон выбран',
                detail: `${startFormatted} - ${endFormatted}`,
                life: 2000
            });
        }
    }

    onDateRangeClear(): void {
        this.dateRange = null;
        this.applyFilter();
        this.messageService.add({
            severity: 'info',
            summary: 'Диапазон сброшен',
            detail: 'Показаны все даты',
            life: 2000
        });
    }

    updateChart(): void {
        const debitTotal = this.filteredInvestments.filter((i) => i.operation_type === 'Дебит').reduce((sum, i) => sum + i.amount, 0);
        const creditTotal = this.filteredInvestments.filter((i) => i.operation_type === 'Кредит').reduce((sum, i) => sum + i.amount, 0);
        const filterValue = this.selectedOperation?.value || 'Все';

        const debitColors = {
            background: ['#43a047', '#66bb6a'],
            hover: ['#2e7d32', '#43a047'],
            border: '#ffffff'
        };

        const creditColors = {
            background: ['#e53935', '#ef5350'],
            hover: ['#c62828', '#e53935'],
            border: '#ffffff'
        };

        if (filterValue === 'Все') {
            this.chartData = {
                labels: ['Дебит', 'Кредит'],
                datasets: [{
                    data: [debitTotal, creditTotal],
                    backgroundColor: [debitColors.background[0], creditColors.background[0]],
                    hoverBackgroundColor: [debitColors.hover[0], creditColors.hover[0]],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverOffset: 8
                }]
            };
        } else if (filterValue === 'Дебит') {
            this.chartData = {
                labels: ['Дебит'],
                datasets: [{
                    data: [debitTotal],
                    backgroundColor: debitColors.background,
                    hoverBackgroundColor: debitColors.hover,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            };
        } else {
            this.chartData = {
                labels: ['Кредит'],
                datasets: [{
                    data: [creditTotal],
                    backgroundColor: creditColors.background,
                    hoverBackgroundColor: creditColors.hover,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            };
        }
    }

    updateLineChart(): void {
        const map = new Map<string, { debit: number; credit: number }>();
        this.filteredInvestments.forEach((item) => {
            const dateKey = item.date.toISOString().split('T')[0];
            if (!map.has(dateKey)) map.set(dateKey, { debit: 0, credit: 0 });
            const entry = map.get(dateKey)!;
            if (item.operation_type === 'Дебит') entry.debit += item.amount;
            else entry.credit += item.amount;
        });

        const labels = Array.from(map.keys()).sort();
        this.lineChartData = {
            labels,
            datasets: [
                {
                    label: 'Дебит',
                    data: labels.map((d) => map.get(d)!.debit),
                    borderColor: '#43a047',
                    backgroundColor: 'rgba(67, 160, 71, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#43a047',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#2e7d32',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3
                },
                {
                    label: 'Кредит',
                    data: labels.map((d) => map.get(d)!.credit),
                    borderColor: '#e53935',
                    backgroundColor: 'rgba(229, 57, 53, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#e53935',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#c62828',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3
                }
            ]
        };
    }

    get totalDebit(): number {
        return this.filteredInvestments.filter((i) => i.operation_type === 'Дебит').reduce((sum, i) => sum + i.amount, 0);
    }

    get totalCredit(): number {
        return this.filteredInvestments.filter((i) => i.operation_type === 'Кредит').reduce((sum, i) => sum + i.amount, 0);
    }

    get balance(): number {
        return this.totalDebit - this.totalCredit;
    }

    // Dialog methods
    openNew() {
        this.isEditMode = false;
        this.currentInvestmentId = null;
        this.currentInvestment = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editInvestment(investment: InvestmentData) {
        this.isEditMode = true;
        this.currentInvestmentId = investment.id;
        this.currentInvestment = investment;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        this.existingFilesToKeep = investment.files?.map((f) => f.id) || [];

        this.form.patchValue({
            project_name: investment.project_name,
            status: this.statusOptions.find((s) => s.value === investment.status) || null,
            operation_type: this.operationTypeOptions.find((o) => o.value === investment.operation_type) || null,
            amount: investment.amount,
            priority: this.priorityOptions.find((p) => p.value === investment.priority) || null,
            date: investment.date,
            comment: investment.comment
        });

        this.isFormOpen = true;
    }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;
        const rawPayload = this.form.getRawValue();

        const investmentData: InvestmentData = {
            id: this.isEditMode && this.currentInvestmentId ? this.currentInvestmentId : Date.now(),
            project_name: rawPayload.project_name || '',
            status: rawPayload.status?.value || 'Новый',
            operation_type: rawPayload.operation_type?.value || 'Дебит',
            amount: rawPayload.amount || 0,
            priority: rawPayload.priority?.value || 'Средний',
            date: rawPayload.date || new Date(),
            comment: rawPayload.comment || '',
            files: []
        };

        // Handle files
        if (this.isEditMode && this.currentInvestment) {
            // Keep existing files that weren't removed
            const existingFiles = this.currentInvestment.files?.filter((f) => this.existingFilesToKeep.includes(f.id)) || [];
            investmentData.files = [...existingFiles];
        }

        // Add new files
        const newFiles: FileData[] = this.selectedFiles.map((file, index) => ({
            id: Date.now() + index,
            file_name: file.name,
            size_bytes: file.size,
            url: URL.createObjectURL(file),
            file: file
        }));

        investmentData.files = [...(investmentData.files || []), ...newFiles];

        if (this.isEditMode && this.currentInvestmentId) {
            const index = this.investments.findIndex((inv) => inv.id === this.currentInvestmentId);
            if (index !== -1) {
                this.investments[index] = investmentData;
            }
            this.messageService.add({ severity: 'success', summary: 'Проект обновлен' });
        } else {
            this.investments.push(investmentData);
            this.messageService.add({ severity: 'success', summary: 'Проект добавлен' });
        }

        this.closeDialog();
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentInvestmentId = null;
        this.currentInvestment = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.form.reset();
        this.applyFilter();
        this.updateDashboardData();
    }

    deleteInvestment(id: number) {
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            this.investments = this.investments.filter((inv) => inv.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Проект удален' });
            this.applyFilter();
            this.updateDashboardData();
        }
    }

    // File methods
    onFileSelect(files: File[]) {
        this.selectedFiles = files;
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    removeExistingFile(fileId: number) {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        if (this.currentInvestment?.files) {
            this.currentInvestment.files = this.currentInvestment.files.filter((f) => f.id !== fileId);
        }
    }

    showFiles(investment: InvestmentData) {
        this.selectedInvestmentForFiles = investment;
        this.showFilesDialog = true;
    }

    // Chart click handlers
    onDoughnutClick(event: any, elements: any[]): void {
        if (elements.length > 0) {
            const index = elements[0].index;
            const label = this.chartData.labels[index];

            if (label === 'Дебит') {
                this.selectedOperation = this.operationOptions.find(o => o.value === 'Дебит');
            } else if (label === 'Кредит') {
                this.selectedOperation = this.operationOptions.find(o => o.value === 'Кредит');
            }

            this.applyFilter();
            this.messageService.add({
                severity: 'info',
                summary: 'Фильтр применён',
                detail: `Показаны операции: ${label}`,
                life: 2000
            });
        }
    }

    onLineChartClick(event: any, elements: any[]): void {
        if (elements.length > 0) {
            const datasetIndex = elements[0].datasetIndex;
            const dataIndex = elements[0].index;
            const date = this.lineChartData.labels[dataIndex];
            const datasetLabel = this.lineChartData.datasets[datasetIndex].label;

            // Filter by operation type
            if (datasetLabel === 'Дебит') {
                this.selectedOperation = this.operationOptions.find(o => o.value === 'Дебит');
            } else if (datasetLabel === 'Кредит') {
                this.selectedOperation = this.operationOptions.find(o => o.value === 'Кредит');
            }

            this.applyFilter();

            const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long'
            });

            this.messageService.add({
                severity: 'info',
                summary: 'Фильтр применён',
                detail: `${datasetLabel} за ${formattedDate}`,
                life: 2000
            });
        }
    }

    resetFilter(): void {
        this.selectedOperation = this.operationOptions[0];
        this.applyFilter();
        this.messageService.add({
            severity: 'info',
            summary: 'Фильтр сброшен',
            detail: 'Показаны все операции',
            life: 2000
        });
    }
}
