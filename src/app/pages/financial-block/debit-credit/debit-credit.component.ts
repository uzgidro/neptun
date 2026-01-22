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
import { FinancialDashboardService } from '../dashboard/services/financial-dashboard.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Category {
    label: string;
    value: string;
    icon: string;
}

interface Transaction {
    id: number;
    date: Date;
    description: string;
    category: string;
    counterparty: string;
    debit: number | null;
    credit: number | null;
    status: 'completed' | 'pending' | 'cancelled';
    balance?: number;
}

@Component({
    selector: 'app-debit-credit',
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
        TranslateModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './debit-credit.component.html',
    styleUrl: './debit-credit.component.scss'
})
export class DebitCreditComponent implements OnInit {
    transactions: Transaction[] = [];
    filteredTransactions: Transaction[] = [];

    // Dialog
    transactionDialog: boolean = false;
    isEditMode: boolean = false;
    currentTransaction: Transaction = this.getEmptyTransaction();

    // Filters
    searchText: string = '';
    dateRange: Date[] = [];
    selectedCategory: string | null = null;
    selectedStatus: string | null = null;
    transactionTypeFilter: string | null = null;

    // Dropdown options
    categories: Category[] = [];
    statuses: { label: string; value: string }[] = [];
    transactionTypes: { label: string; value: string | null }[] = [];

    // Charts
    categoryChartData: any;
    categoryChartOptions: any;
    monthlyChartData: any;
    monthlyChartOptions: any;
    debitCreditCompareData: any;
    debitCreditCompareOptions: any;

    private dashboardService = inject(FinancialDashboardService);
    private translate = inject(TranslateService);

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.initTranslations();
        this.loadTransactions();
        this.applyFilters();
        this.initCharts();
        this.updateDashboardData();

        // Subscribe to language changes
        this.translate.onLangChange.subscribe(() => {
            this.initTranslations();
            this.updateCharts();
        });
    }

    private initTranslations(): void {
        this.categories = [
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_SALES'), value: 'sales', icon: 'pi pi-shopping-cart' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_RENT'), value: 'rent', icon: 'pi pi-home' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_SALARY'), value: 'salary', icon: 'pi pi-users' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_PURCHASES'), value: 'purchases', icon: 'pi pi-box' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_SERVICES'), value: 'services', icon: 'pi pi-briefcase' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_TAXES'), value: 'taxes', icon: 'pi pi-percentage' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CATEGORY_OTHER'), value: 'other', icon: 'pi pi-ellipsis-h' }
        ];

        this.statuses = [
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.STATUS_COMPLETED'), value: 'completed' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.STATUS_PENDING'), value: 'pending' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.STATUS_CANCELLED'), value: 'cancelled' }
        ];

        this.transactionTypes = [
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TYPE_ALL'), value: null },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TYPE_DEBIT_ONLY'), value: 'debit' },
            { label: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TYPE_CREDIT_ONLY'), value: 'credit' }
        ];
    }

    private updateDashboardData(): void {
        const pendingCount = this.transactions.filter(t => t.status === 'pending').length;
        this.dashboardService.updateDebitCredit({
            totalDebit: this.totalDebit,
            totalCredit: this.totalCredit,
            balance: this.balance,
            transactionsCount: this.transactions.length,
            pendingCount
        });
    }

    loadTransactions() {
        this.transactions = [
            { id: 1, date: new Date(2024, 11, 1), description: 'Поступление от клиента А', category: 'sales', counterparty: 'ТОО "Альфа"', debit: 150000, credit: null, status: 'completed' },
            { id: 2, date: new Date(2024, 11, 3), description: 'Оплата аренды офиса', category: 'rent', counterparty: 'ИП Иванов', debit: null, credit: 85000, status: 'completed' },
            { id: 3, date: new Date(2024, 11, 5), description: 'Закупка материалов', category: 'purchases', counterparty: 'ТОО "Снабжение"', debit: null, credit: 45000, status: 'completed' },
            { id: 4, date: new Date(2024, 11, 7), description: 'Поступление от клиента Б', category: 'sales', counterparty: 'АО "Бета"', debit: 280000, credit: null, status: 'completed' },
            { id: 5, date: new Date(2024, 11, 10), description: 'Выплата зарплаты', category: 'salary', counterparty: 'Сотрудники', debit: null, credit: 320000, status: 'completed' },
            { id: 6, date: new Date(2024, 11, 12), description: 'Оплата услуг связи', category: 'services', counterparty: 'Beeline', debit: null, credit: 15000, status: 'pending' },
            { id: 7, date: new Date(2024, 11, 15), description: 'Поступление от клиента В', category: 'sales', counterparty: 'ТОО "Гамма"', debit: 95000, credit: null, status: 'pending' },
            { id: 8, date: new Date(2024, 11, 18), description: 'Уплата налогов', category: 'taxes', counterparty: 'КГД', debit: null, credit: 67000, status: 'completed' }
        ];
        this.calculateBalances();
    }

    calculateBalances() {
        let runningBalance = 0;
        const sorted = [...this.transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
        sorted.forEach(t => {
            runningBalance += (t.debit || 0) - (t.credit || 0);
            t.balance = runningBalance;
        });
    }

    // Computed totals
    get totalDebit(): number {
        return this.filteredTransactions
            .filter(t => t.status !== 'cancelled')
            .reduce((sum, t) => sum + (t.debit || 0), 0);
    }

    get totalCredit(): number {
        return this.filteredTransactions
            .filter(t => t.status !== 'cancelled')
            .reduce((sum, t) => sum + (t.credit || 0), 0);
    }

    get balance(): number {
        return this.totalDebit - this.totalCredit;
    }

    // Filters
    applyFilters() {
        let result = [...this.transactions];

        // Search filter
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            result = result.filter(t =>
                t.description.toLowerCase().includes(search) ||
                t.counterparty.toLowerCase().includes(search)
            );
        }

        // Date range filter
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            result = result.filter(t =>
                t.date >= this.dateRange[0] && t.date <= this.dateRange[1]
            );
        }

        // Category filter
        if (this.selectedCategory) {
            result = result.filter(t => t.category === this.selectedCategory);
        }

        // Status filter
        if (this.selectedStatus) {
            result = result.filter(t => t.status === this.selectedStatus);
        }

        // Transaction type filter
        if (this.transactionTypeFilter === 'debit') {
            result = result.filter(t => t.debit !== null && t.debit > 0);
        } else if (this.transactionTypeFilter === 'credit') {
            result = result.filter(t => t.credit !== null && t.credit > 0);
        }

        // Sort by date descending
        result.sort((a, b) => b.date.getTime() - a.date.getTime());

        this.filteredTransactions = result;

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
        this.transactionTypeFilter = null;
        this.applyFilters();
    }

    // CRUD Operations
    getEmptyTransaction(): Transaction {
        return {
            id: 0,
            date: new Date(),
            description: '',
            category: 'other',
            counterparty: '',
            debit: null,
            credit: null,
            status: 'pending'
        };
    }

    openNewTransaction() {
        this.currentTransaction = this.getEmptyTransaction();
        this.isEditMode = false;
        this.transactionDialog = true;
    }

    editTransaction(transaction: Transaction) {
        this.currentTransaction = { ...transaction };
        this.isEditMode = true;
        this.transactionDialog = true;
    }

    saveTransaction() {
        if (!this.currentTransaction.description || !this.currentTransaction.counterparty) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.COMMON.FILL_REQUIRED')
            });
            return;
        }

        if (!this.currentTransaction.debit && !this.currentTransaction.credit) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.SPECIFY_AMOUNT')
            });
            return;
        }

        if (this.isEditMode) {
            const index = this.transactions.findIndex(t => t.id === this.currentTransaction.id);
            if (index !== -1) {
                this.transactions[index] = { ...this.currentTransaction };
            }
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TRANSACTION_UPDATED')
            });
        } else {
            this.currentTransaction.id = Math.max(...this.transactions.map(t => t.id), 0) + 1;
            this.transactions.push({ ...this.currentTransaction });
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TRANSACTION_ADDED')
            });
        }

        this.calculateBalances();
        this.applyFilters();
        this.updateDashboardData();
        this.transactionDialog = false;
    }

    deleteTransaction(transaction: Transaction) {
        this.confirmationService.confirm({
            message: `${this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.DELETE_CONFIRM')} "${transaction.description}"?`,
            header: this.translate.instant('FINANCIAL_BLOCK.COMMON.CONFIRM_DELETE'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('FINANCIAL_BLOCK.COMMON.YES'),
            rejectLabel: this.translate.instant('FINANCIAL_BLOCK.COMMON.NO'),
            accept: () => {
                this.transactions = this.transactions.filter(t => t.id !== transaction.id);
                this.calculateBalances();
                this.applyFilters();
                this.updateDashboardData();
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
                    detail: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TRANSACTION_DELETED')
                });
            }
        });
    }

    duplicateTransaction(transaction: Transaction) {
        const newTransaction: Transaction = {
            ...transaction,
            id: Math.max(...this.transactions.map(t => t.id), 0) + 1,
            date: new Date(),
            status: 'pending'
        };
        this.transactions.push(newTransaction);
        this.calculateBalances();
        this.applyFilters();
        this.updateDashboardData();
        this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
            detail: this.translate.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.TRANSACTION_DUPLICATED')
        });
    }

    // Helpers
    getCategoryLabel(value: string): string {
        return this.categories.find(c => c.value === value)?.label || value;
    }

    getCategoryIcon(value: string): string {
        return this.categories.find(c => c.value === value)?.icon || 'pi pi-tag';
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warn';
            case 'cancelled': return 'danger';
            default: return 'info';
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

    // Export to Excel
    exportToExcel() {
        const t = this.translate;
        const dateCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.DATE');
        const descCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.DESCRIPTION');
        const catCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.CATEGORY');
        const counterCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.COUNTERPARTY');
        const debitCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.DEBIT');
        const creditCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.CREDIT');
        const balanceCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.BALANCE');
        const statusCol = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.STATUS');
        const totalLabel = t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.EXPORT_COLUMNS.TOTAL');

        const data = this.filteredTransactions.map(tr => ({
            [dateCol]: new Date(tr.date).toLocaleDateString('ru-RU'),
            [descCol]: tr.description,
            [catCol]: this.getCategoryLabel(tr.category),
            [counterCol]: tr.counterparty,
            [debitCol]: tr.debit || '',
            [creditCol]: tr.credit || '',
            [balanceCol]: tr.balance || 0,
            [statusCol]: this.getStatusLabel(tr.status)
        }));

        // Add totals row
        data.push({
            [dateCol]: '',
            [descCol]: totalLabel,
            [catCol]: '',
            [counterCol]: '',
            [debitCol]: this.totalDebit,
            [creditCol]: this.totalCredit,
            [balanceCol]: this.balance,
            [statusCol]: ''
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
        link.setAttribute('download', `debit-credit-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.messageService.add({
            severity: 'success',
            summary: t.instant('FINANCIAL_BLOCK.COMMON.EXPORT'),
            detail: t.instant('FINANCIAL_BLOCK.COMMON.EXPORT_SUCCESS')
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

        // Debit vs Credit Doughnut Chart Options
        this.debitCreditCompareOptions = {
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
        this.updateDebitCreditCompareChart();
    }

    updateCategoryChart() {
        const categoryTotals: { [key: string]: number } = {};

        // Calculate totals by category (only credits/expenses)
        this.filteredTransactions
            .filter(t => t.status !== 'cancelled' && t.credit)
            .forEach(t => {
                const category = t.category;
                categoryTotals[category] = (categoryTotals[category] || 0) + (t.credit || 0);
            });

        const labels = Object.keys(categoryTotals).map(key => this.getCategoryLabel(key));
        const data = Object.values(categoryTotals);

        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF'
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
        const t = this.translate;
        const months = [
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.JAN'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.FEB'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.MAR'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.APR'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.MAY'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.JUN'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.JUL'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.AUG'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.SEP'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.OCT'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.NOV'),
            t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.MONTHS.DEC')
        ];
        const debitByMonth: number[] = new Array(12).fill(0);
        const creditByMonth: number[] = new Array(12).fill(0);

        this.transactions
            .filter(tr => tr.status !== 'cancelled')
            .forEach(tr => {
                const month = tr.date.getMonth();
                debitByMonth[month] += tr.debit || 0;
                creditByMonth[month] += tr.credit || 0;
            });

        this.monthlyChartData = {
            labels: months,
            datasets: [
                {
                    label: t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.DEBIT_INCOME'),
                    data: debitByMonth,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22c55e',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CREDIT_EXPENSE'),
                    data: creditByMonth,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        };
    }

    updateDebitCreditCompareChart() {
        const t = this.translate;
        this.debitCreditCompareData = {
            labels: [
                t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.DEBIT'),
                t.instant('FINANCIAL_BLOCK.DEBIT_CREDIT.CREDIT')
            ],
            datasets: [{
                data: [this.totalDebit, this.totalCredit],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                hoverBackgroundColor: ['#22c55e', '#ef4444'],
                borderWidth: 0
            }]
        };
    }
}
