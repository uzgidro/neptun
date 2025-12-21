import { Component, OnInit } from '@angular/core';
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
        ChartModule
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
    categories: Category[] = [
        { label: 'Продажи', value: 'sales', icon: 'pi pi-shopping-cart' },
        { label: 'Аренда', value: 'rent', icon: 'pi pi-home' },
        { label: 'Зарплата', value: 'salary', icon: 'pi pi-users' },
        { label: 'Закупки', value: 'purchases', icon: 'pi pi-box' },
        { label: 'Услуги', value: 'services', icon: 'pi pi-briefcase' },
        { label: 'Налоги', value: 'taxes', icon: 'pi pi-percentage' },
        { label: 'Прочее', value: 'other', icon: 'pi pi-ellipsis-h' }
    ];

    statuses = [
        { label: 'Проведено', value: 'completed' },
        { label: 'Ожидание', value: 'pending' },
        { label: 'Отменено', value: 'cancelled' }
    ];

    transactionTypes = [
        { label: 'Все', value: null },
        { label: 'Только дебит', value: 'debit' },
        { label: 'Только кредит', value: 'credit' }
    ];

    // Charts
    categoryChartData: any;
    categoryChartOptions: any;
    monthlyChartData: any;
    monthlyChartOptions: any;
    debitCreditCompareData: any;
    debitCreditCompareOptions: any;

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadTransactions();
        this.applyFilters();
        this.initCharts();
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
                summary: 'Внимание',
                detail: 'Заполните обязательные поля'
            });
            return;
        }

        if (!this.currentTransaction.debit && !this.currentTransaction.credit) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Укажите сумму дебита или кредита'
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
                summary: 'Успешно',
                detail: 'Транзакция обновлена'
            });
        } else {
            this.currentTransaction.id = Math.max(...this.transactions.map(t => t.id), 0) + 1;
            this.transactions.push({ ...this.currentTransaction });
            this.messageService.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Транзакция добавлена'
            });
        }

        this.calculateBalances();
        this.applyFilters();
        this.transactionDialog = false;
    }

    deleteTransaction(transaction: Transaction) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить транзакцию "${transaction.description}"?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Да',
            rejectLabel: 'Нет',
            accept: () => {
                this.transactions = this.transactions.filter(t => t.id !== transaction.id);
                this.calculateBalances();
                this.applyFilters();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Успешно',
                    detail: 'Транзакция удалена'
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
        this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Транзакция дублирована'
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
        const data = this.filteredTransactions.map(t => ({
            'Дата': new Date(t.date).toLocaleDateString('ru-RU'),
            'Описание': t.description,
            'Категория': this.getCategoryLabel(t.category),
            'Контрагент': t.counterparty,
            'Дебит': t.debit || '',
            'Кредит': t.credit || '',
            'Баланс': t.balance || 0,
            'Статус': this.getStatusLabel(t.status)
        }));

        // Add totals row
        data.push({
            'Дата': '',
            'Описание': 'ИТОГО',
            'Категория': '',
            'Контрагент': '',
            'Дебит': this.totalDebit,
            'Кредит': this.totalCredit,
            'Баланс': this.balance,
            'Статус': ''
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
        link.setAttribute('download', `debit-credit-${new Date().toISOString().split('T')[0]}.csv`);
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
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const debitByMonth: number[] = new Array(12).fill(0);
        const creditByMonth: number[] = new Array(12).fill(0);

        this.transactions
            .filter(t => t.status !== 'cancelled')
            .forEach(t => {
                const month = t.date.getMonth();
                debitByMonth[month] += t.debit || 0;
                creditByMonth[month] += t.credit || 0;
            });

        this.monthlyChartData = {
            labels: months,
            datasets: [
                {
                    label: 'Дебит (приход)',
                    data: debitByMonth,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22c55e',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Кредит (расход)',
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
        this.debitCreditCompareData = {
            labels: ['Дебит', 'Кредит'],
            datasets: [{
                data: [this.totalDebit, this.totalCredit],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                hoverBackgroundColor: ['#22c55e', '#ef4444'],
                borderWidth: 0
            }]
        };
    }
}
