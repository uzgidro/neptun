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
import { DividerModule } from 'primeng/divider';
import { FinancialDashboardService } from '../dashboard/services/financial-dashboard.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface SalaryRecord {
    id: number;
    employeeId: string;
    fullName: string;
    department: string;
    position: string;
    periodMonth: number;
    periodYear: number;
    baseSalary: number;
    seniorityBonus: number;
    qualificationBonus: number;
    hazardBonus: number;
    otherBonuses: number;
    premium: number;
    workedDays: number;
    totalDays: number;
    sickLeaveDays: number;
    vacationDays: number;
    incomeTax: number;
    pensionFund: number;
    otherDeductions: number;
    totalAccrued: number;
    totalDeductions: number;
    netPay: number;
    status: 'calculated' | 'paid' | 'delayed';
    paymentDate: Date | null;
    notes: string;
}

@Component({
    selector: 'app-salary',
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
        DividerModule,
        TranslateModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './salary.component.html',
    styleUrl: './salary.component.scss'
})
export class SalaryComponent implements OnInit {
    salaries: SalaryRecord[] = [];
    filteredSalaries: SalaryRecord[] = [];

    // Dialog
    salaryDialog: boolean = false;
    isEditMode: boolean = false;
    currentSalary: SalaryRecord = this.getEmptySalary();

    // Filters
    searchText: string = '';
    selectedDepartment: string | null = null;
    selectedStatus: string | null = null;
    selectedMonth: number | null = null;
    selectedYear: number | null = null;

    // Dropdown options - initialized in initTranslations()
    departments: { label: string; value: string }[] = [];
    statuses: { label: string; value: string }[] = [];
    months: { label: string; value: number }[] = [];
    positions: { label: string; value: string }[] = [];

    years = [
        { label: '2024', value: 2024 },
        { label: '2023', value: 2023 },
        { label: '2022', value: 2022 }
    ];

    // Charts
    monthlyChartData: any;
    monthlyChartOptions: any;
    departmentChartData: any;
    departmentChartOptions: any;
    structureChartData: any;
    structureChartOptions: any;
    deductionsChartData: any;
    deductionsChartOptions: any;

    private dashboardService = inject(FinancialDashboardService);
    private translate = inject(TranslateService);

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.initTranslations();
        this.loadSalaries();
        this.selectedMonth = new Date().getMonth() + 1;
        this.selectedYear = new Date().getFullYear();
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

        this.departments = [
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_PRODUCTION'), value: 'production' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_TECHNICAL'), value: 'technical' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_FINANCE'), value: 'finance' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_IT'), value: 'it' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_HR'), value: 'hr' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_ADMIN'), value: 'admin' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.DEPT_SECURITY'), value: 'security' }
        ];

        this.statuses = [
            { label: t.instant('FINANCIAL_BLOCK.SALARY.STATUS_CALCULATED'), value: 'calculated' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.STATUS_PAID'), value: 'paid' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.STATUS_DELAYED'), value: 'delayed' }
        ];

        this.months = [
            { label: t.instant('COMMON.MONTHS_FULL.JAN'), value: 1 },
            { label: t.instant('COMMON.MONTHS_FULL.FEB'), value: 2 },
            { label: t.instant('COMMON.MONTHS_FULL.MAR'), value: 3 },
            { label: t.instant('COMMON.MONTHS_FULL.APR'), value: 4 },
            { label: t.instant('COMMON.MONTHS_FULL.MAY'), value: 5 },
            { label: t.instant('COMMON.MONTHS_FULL.JUN'), value: 6 },
            { label: t.instant('COMMON.MONTHS_FULL.JUL'), value: 7 },
            { label: t.instant('COMMON.MONTHS_FULL.AUG'), value: 8 },
            { label: t.instant('COMMON.MONTHS_FULL.SEP'), value: 9 },
            { label: t.instant('COMMON.MONTHS_FULL.OCT'), value: 10 },
            { label: t.instant('COMMON.MONTHS_FULL.NOV'), value: 11 },
            { label: t.instant('COMMON.MONTHS_FULL.DEC'), value: 12 }
        ];

        this.positions = [
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_DIRECTOR'), value: 'director' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_CHIEF_ENGINEER'), value: 'chief_engineer' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_HEAD_OF_DEPARTMENT'), value: 'head_of_department' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_LEAD_SPECIALIST'), value: 'lead_specialist' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_SPECIALIST'), value: 'specialist' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_ENGINEER'), value: 'engineer' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_TECHNICIAN'), value: 'technician' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_OPERATOR'), value: 'operator' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_ACCOUNTANT'), value: 'accountant' },
            { label: t.instant('FINANCIAL_BLOCK.SALARY.POSITION_PROGRAMMER'), value: 'programmer' }
        ];
    }

    private updateDashboardData(): void {
        this.dashboardService.updateSalary({
            totalFOT: this.totalFOT,
            totalNetPay: this.totalNetPay,
            averageSalary: this.averageSalary,
            totalDeductions: this.totalDeductions,
            employeesCount: this.employeesCount,
            paidCount: this.paidCount,
            pendingAmount: this.pendingAmount
        });
    }

    loadSalaries() {
        this.salaries = [
            // December 2024
            { id: 1, employeeId: 'EMP001', fullName: 'Иванов Иван Иванович', department: 'production', position: 'chief_engineer', periodMonth: 12, periodYear: 2024, baseSalary: 15000000, seniorityBonus: 1500000, qualificationBonus: 2000000, hazardBonus: 1000000, otherBonuses: 0, premium: 3000000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 2700000, pensionFund: 900000, otherDeductions: 0, totalAccrued: 22500000, totalDeductions: 3600000, netPay: 18900000, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 2, employeeId: 'EMP002', fullName: 'Петров Пётр Петрович', department: 'technical', position: 'lead_specialist', periodMonth: 12, periodYear: 2024, baseSalary: 12000000, seniorityBonus: 1200000, qualificationBonus: 1500000, hazardBonus: 800000, otherBonuses: 0, premium: 2000000, workedDays: 20, totalDays: 22, sickLeaveDays: 2, vacationDays: 0, incomeTax: 2045000, pensionFund: 681700, otherDeductions: 0, totalAccrued: 17500000, totalDeductions: 2726700, netPay: 14773300, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 3, employeeId: 'EMP003', fullName: 'Сидорова Анна Александровна', department: 'finance', position: 'accountant', periodMonth: 12, periodYear: 2024, baseSalary: 10000000, seniorityBonus: 500000, qualificationBonus: 1000000, hazardBonus: 0, otherBonuses: 0, premium: 1500000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 1560000, pensionFund: 520000, otherDeductions: 0, totalAccrued: 13000000, totalDeductions: 2080000, netPay: 10920000, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 4, employeeId: 'EMP004', fullName: 'Козлов Константин Константинович', department: 'it', position: 'programmer', periodMonth: 12, periodYear: 2024, baseSalary: 14000000, seniorityBonus: 700000, qualificationBonus: 2000000, hazardBonus: 0, otherBonuses: 500000, premium: 2500000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 2364000, pensionFund: 788000, otherDeductions: 0, totalAccrued: 19700000, totalDeductions: 3152000, netPay: 16548000, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 5, employeeId: 'EMP005', fullName: 'Морозова Мария Михайловна', department: 'hr', position: 'head_of_department', periodMonth: 12, periodYear: 2024, baseSalary: 11000000, seniorityBonus: 1100000, qualificationBonus: 1500000, hazardBonus: 0, otherBonuses: 0, premium: 2000000, workedDays: 18, totalDays: 22, sickLeaveDays: 0, vacationDays: 4, incomeTax: 1872000, pensionFund: 624000, otherDeductions: 0, totalAccrued: 15600000, totalDeductions: 2496000, netPay: 13104000, status: 'calculated', paymentDate: null, notes: 'Отпуск 4 дня' },
            { id: 6, employeeId: 'EMP006', fullName: 'Новиков Николай Николаевич', department: 'production', position: 'operator', periodMonth: 12, periodYear: 2024, baseSalary: 8000000, seniorityBonus: 400000, qualificationBonus: 500000, hazardBonus: 1200000, otherBonuses: 0, premium: 1000000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 1332000, pensionFund: 444000, otherDeductions: 0, totalAccrued: 11100000, totalDeductions: 1776000, netPay: 9324000, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 7, employeeId: 'EMP007', fullName: 'Волков Владимир Владимирович', department: 'security', position: 'specialist', periodMonth: 12, periodYear: 2024, baseSalary: 7000000, seniorityBonus: 350000, qualificationBonus: 0, hazardBonus: 500000, otherBonuses: 0, premium: 500000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 1002000, pensionFund: 334000, otherDeductions: 0, totalAccrued: 8350000, totalDeductions: 1336000, netPay: 7014000, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 8, employeeId: 'EMP008', fullName: 'Зайцев Захар Захарович', department: 'technical', position: 'engineer', periodMonth: 12, periodYear: 2024, baseSalary: 9000000, seniorityBonus: 450000, qualificationBonus: 1000000, hazardBonus: 600000, otherBonuses: 0, premium: 1200000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 1470000, pensionFund: 490000, otherDeductions: 0, totalAccrued: 12250000, totalDeductions: 1960000, netPay: 10290000, status: 'calculated', paymentDate: null, notes: '' },
            { id: 9, employeeId: 'EMP009', fullName: 'Белова Бэлла Борисовна', department: 'admin', position: 'specialist', periodMonth: 12, periodYear: 2024, baseSalary: 7500000, seniorityBonus: 375000, qualificationBonus: 500000, hazardBonus: 0, otherBonuses: 0, premium: 800000, workedDays: 22, totalDays: 22, sickLeaveDays: 0, vacationDays: 0, incomeTax: 1101000, pensionFund: 367000, otherDeductions: 0, totalAccrued: 9175000, totalDeductions: 1468000, netPay: 7707000, status: 'paid', paymentDate: new Date(2024, 11, 10), notes: '' },
            { id: 10, employeeId: 'EMP010', fullName: 'Орлов Олег Олегович', department: 'production', position: 'technician', periodMonth: 12, periodYear: 2024, baseSalary: 6500000, seniorityBonus: 325000, qualificationBonus: 400000, hazardBonus: 800000, otherBonuses: 0, premium: 600000, workedDays: 20, totalDays: 22, sickLeaveDays: 2, vacationDays: 0, incomeTax: 1035000, pensionFund: 345000, otherDeductions: 0, totalAccrued: 8625000, totalDeductions: 1380000, netPay: 7245000, status: 'delayed', paymentDate: null, notes: 'Задержка выплаты' },

            // November 2024
            { id: 11, employeeId: 'EMP001', fullName: 'Иванов Иван Иванович', department: 'production', position: 'chief_engineer', periodMonth: 11, periodYear: 2024, baseSalary: 15000000, seniorityBonus: 1500000, qualificationBonus: 2000000, hazardBonus: 1000000, otherBonuses: 0, premium: 2500000, workedDays: 21, totalDays: 21, sickLeaveDays: 0, vacationDays: 0, incomeTax: 2640000, pensionFund: 880000, otherDeductions: 0, totalAccrued: 22000000, totalDeductions: 3520000, netPay: 18480000, status: 'paid', paymentDate: new Date(2024, 10, 10), notes: '' },
            { id: 12, employeeId: 'EMP002', fullName: 'Петров Пётр Петрович', department: 'technical', position: 'lead_specialist', periodMonth: 11, periodYear: 2024, baseSalary: 12000000, seniorityBonus: 1200000, qualificationBonus: 1500000, hazardBonus: 800000, otherBonuses: 0, premium: 1800000, workedDays: 21, totalDays: 21, sickLeaveDays: 0, vacationDays: 0, incomeTax: 2076000, pensionFund: 692000, otherDeductions: 0, totalAccrued: 17300000, totalDeductions: 2768000, netPay: 14532000, status: 'paid', paymentDate: new Date(2024, 10, 10), notes: '' }
        ];
    }

    // Computed totals
    get totalFOT(): number {
        return this.filteredSalaries.reduce((sum, s) => sum + s.totalAccrued, 0);
    }

    get totalNetPay(): number {
        return this.filteredSalaries.reduce((sum, s) => sum + s.netPay, 0);
    }

    get averageSalary(): number {
        if (this.filteredSalaries.length === 0) return 0;
        return Math.round(this.totalNetPay / this.filteredSalaries.length);
    }

    get employeesCount(): number {
        return this.filteredSalaries.length;
    }

    get paidCount(): number {
        return this.filteredSalaries.filter(s => s.status === 'paid').length;
    }

    get pendingAmount(): number {
        return this.filteredSalaries
            .filter(s => s.status !== 'paid')
            .reduce((sum, s) => sum + s.netPay, 0);
    }

    get totalDeductions(): number {
        return this.filteredSalaries.reduce((sum, s) => sum + s.totalDeductions, 0);
    }

    // Filters
    applyFilters() {
        let result = [...this.salaries];

        // Search filter
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            result = result.filter(s =>
                s.fullName.toLowerCase().includes(search) ||
                s.employeeId.toLowerCase().includes(search)
            );
        }

        // Department filter
        if (this.selectedDepartment) {
            result = result.filter(s => s.department === this.selectedDepartment);
        }

        // Status filter
        if (this.selectedStatus) {
            result = result.filter(s => s.status === this.selectedStatus);
        }

        // Month filter
        if (this.selectedMonth) {
            result = result.filter(s => s.periodMonth === this.selectedMonth);
        }

        // Year filter
        if (this.selectedYear) {
            result = result.filter(s => s.periodYear === this.selectedYear);
        }

        // Sort by fullName
        result.sort((a, b) => a.fullName.localeCompare(b.fullName));

        this.filteredSalaries = result;

        // Update charts only if they are initialized
        if (this.monthlyChartData) {
            this.updateCharts();
        }
    }

    clearFilters() {
        this.searchText = '';
        this.selectedDepartment = null;
        this.selectedStatus = null;
        this.selectedMonth = new Date().getMonth() + 1;
        this.selectedYear = new Date().getFullYear();
        this.applyFilters();
    }

    // CRUD Operations
    getEmptySalary(): SalaryRecord {
        return {
            id: 0,
            employeeId: '',
            fullName: '',
            department: 'production',
            position: 'specialist',
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
            baseSalary: 0,
            seniorityBonus: 0,
            qualificationBonus: 0,
            hazardBonus: 0,
            otherBonuses: 0,
            premium: 0,
            workedDays: 22,
            totalDays: 22,
            sickLeaveDays: 0,
            vacationDays: 0,
            incomeTax: 0,
            pensionFund: 0,
            otherDeductions: 0,
            totalAccrued: 0,
            totalDeductions: 0,
            netPay: 0,
            status: 'calculated',
            paymentDate: null,
            notes: ''
        };
    }

    openNewSalary() {
        this.currentSalary = this.getEmptySalary();
        this.isEditMode = false;
        this.salaryDialog = true;
    }

    editSalary(salary: SalaryRecord) {
        this.currentSalary = { ...salary };
        this.isEditMode = true;
        this.salaryDialog = true;
    }

    calculateSalary() {
        // Calculate total bonuses
        const totalBonuses = this.currentSalary.seniorityBonus +
            this.currentSalary.qualificationBonus +
            this.currentSalary.hazardBonus +
            this.currentSalary.otherBonuses;

        // Calculate base for worked days
        const dailyRate = (this.currentSalary.baseSalary + totalBonuses) / this.currentSalary.totalDays;
        const workedAmount = dailyRate * this.currentSalary.workedDays;

        // Total accrued
        this.currentSalary.totalAccrued = Math.round(workedAmount + this.currentSalary.premium);

        // Calculate deductions (12% income tax, 4% pension fund)
        this.currentSalary.incomeTax = Math.round(this.currentSalary.totalAccrued * 0.12);
        this.currentSalary.pensionFund = Math.round(this.currentSalary.totalAccrued * 0.04);

        // Total deductions
        this.currentSalary.totalDeductions = this.currentSalary.incomeTax +
            this.currentSalary.pensionFund +
            this.currentSalary.otherDeductions;

        // Net pay
        this.currentSalary.netPay = this.currentSalary.totalAccrued - this.currentSalary.totalDeductions;
    }

    saveSalary() {
        if (!this.currentSalary.fullName || !this.currentSalary.employeeId) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.SALARY.FILL_EMPLOYEE_DATA')
            });
            return;
        }

        if (this.currentSalary.baseSalary <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('FINANCIAL_BLOCK.SALARY.SPECIFY_BASE_SALARY')
            });
            return;
        }

        // Recalculate
        this.calculateSalary();

        if (this.isEditMode) {
            const index = this.salaries.findIndex(s => s.id === this.currentSalary.id);
            if (index !== -1) {
                this.salaries[index] = { ...this.currentSalary };
            }
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.SALARY.SALARY_UPDATED')
            });
        } else {
            this.currentSalary.id = Math.max(...this.salaries.map(s => s.id), 0) + 1;
            this.salaries.push({ ...this.currentSalary });
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.SALARY.SALARY_ADDED')
            });
        }

        this.applyFilters();
        this.updateDashboardData();
        this.salaryDialog = false;
    }

    deleteSalary(salary: SalaryRecord) {
        this.confirmationService.confirm({
            message: `${this.translate.instant('FINANCIAL_BLOCK.SALARY.DELETE_CONFIRM')} "${salary.fullName}"?`,
            header: this.translate.instant('COMMON.CONFIRM_DELETE'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('COMMON.YES'),
            rejectLabel: this.translate.instant('COMMON.NO'),
            accept: () => {
                this.salaries = this.salaries.filter(s => s.id !== salary.id);
                this.applyFilters();
                this.updateDashboardData();
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant('FINANCIAL_BLOCK.SALARY.SALARY_DELETED')
                });
            }
        });
    }

    markAsPaid(salary: SalaryRecord) {
        salary.status = 'paid';
        salary.paymentDate = new Date();
        this.applyFilters();
        this.updateDashboardData();
        this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('COMMON.SUCCESS'),
            detail: this.translate.instant('FINANCIAL_BLOCK.SALARY.SALARY_PAID')
        });
    }

    // Helpers
    getDepartmentLabel(value: string): string {
        return this.departments.find(d => d.value === value)?.label || value;
    }

    getPositionLabel(value: string): string {
        return this.positions.find(p => p.value === value)?.label || value;
    }

    getMonthLabel(value: number): string {
        return this.months.find(m => m.value === value)?.label || value.toString();
    }

    getStatusLabel(status: string): string {
        return this.statuses.find(s => s.value === status)?.label || status;
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'paid': return 'success';
            case 'calculated': return 'info';
            case 'delayed': return 'danger';
            default: return 'secondary';
        }
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value) + ' UZS';
    }

    // Export to Excel
    exportToExcel() {
        const t = this.translate;
        const cols = 'FINANCIAL_BLOCK.SALARY.EXPORT_COLUMNS';

        const data = this.filteredSalaries.map(s => ({
            [t.instant(`${cols}.EMPLOYEE_ID`)]: s.employeeId,
            [t.instant(`${cols}.FULL_NAME`)]: s.fullName,
            [t.instant(`${cols}.DEPARTMENT`)]: this.getDepartmentLabel(s.department),
            [t.instant(`${cols}.POSITION`)]: this.getPositionLabel(s.position),
            [t.instant(`${cols}.PERIOD`)]: `${this.getMonthLabel(s.periodMonth)} ${s.periodYear}`,
            [t.instant(`${cols}.BASE_SALARY`)]: s.baseSalary,
            [t.instant(`${cols}.ALLOWANCES`)]: s.seniorityBonus + s.qualificationBonus + s.hazardBonus + s.otherBonuses,
            [t.instant(`${cols}.PREMIUM`)]: s.premium,
            [t.instant(`${cols}.WORKED_DAYS`)]: s.workedDays,
            [t.instant(`${cols}.ACCRUED`)]: s.totalAccrued,
            [t.instant(`${cols}.DEDUCTIONS`)]: s.totalDeductions,
            [t.instant(`${cols}.NET_PAY`)]: s.netPay,
            [t.instant(`${cols}.STATUS`)]: this.getStatusLabel(s.status)
        }));

        // Add totals row
        data.push({
            [t.instant(`${cols}.EMPLOYEE_ID`)]: '',
            [t.instant(`${cols}.FULL_NAME`)]: t.instant(`${cols}.TOTAL_ROW`),
            [t.instant(`${cols}.DEPARTMENT`)]: '',
            [t.instant(`${cols}.POSITION`)]: '',
            [t.instant(`${cols}.PERIOD`)]: '',
            [t.instant(`${cols}.BASE_SALARY`)]: '' as any,
            [t.instant(`${cols}.ALLOWANCES`)]: '' as any,
            [t.instant(`${cols}.PREMIUM`)]: '' as any,
            [t.instant(`${cols}.WORKED_DAYS`)]: '' as any,
            [t.instant(`${cols}.ACCRUED`)]: this.totalFOT,
            [t.instant(`${cols}.DEDUCTIONS`)]: this.filteredSalaries.reduce((sum, s) => sum + s.totalDeductions, 0),
            [t.instant(`${cols}.NET_PAY`)]: this.totalNetPay,
            [t.instant(`${cols}.STATUS`)]: ''
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
        link.setAttribute('download', `salary-${this.selectedMonth}-${this.selectedYear}.csv`);
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
                        callback: (value: number) => (value / 1000000).toFixed(0) + ' млн'
                    },
                    grid: { color: surfaceBorder }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        // Department Pie Chart Options
        this.departmentChartOptions = {
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

        // Structure Doughnut Chart Options
        this.structureChartOptions = {
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

        // Deductions Pie Chart Options
        this.deductionsChartOptions = {
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
        this.updateMonthlyChart();
        this.updateDepartmentChart();
        this.updateStructureChart();
        this.updateDeductionsChart();
    }

    updateMonthlyChart() {
        const monthlyData: { [key: number]: { accrued: number; paid: number } } = {};

        this.salaries
            .filter(s => s.periodYear === this.selectedYear)
            .forEach(s => {
                if (!monthlyData[s.periodMonth]) {
                    monthlyData[s.periodMonth] = { accrued: 0, paid: 0 };
                }
                monthlyData[s.periodMonth].accrued += s.totalAccrued;
                monthlyData[s.periodMonth].paid += s.netPay;
            });

        const shortMonths = [
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
        const accruedData = this.months.map(m => monthlyData[m.value]?.accrued || 0);
        const paidData = this.months.map(m => monthlyData[m.value]?.paid || 0);

        this.monthlyChartData = {
            labels: shortMonths,
            datasets: [
                {
                    label: this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_ACCRUED'),
                    data: accruedData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_NET_PAY'),
                    data: paidData,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22C55E',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        };
    }

    updateDepartmentChart() {
        const departmentTotals: { [key: string]: number } = {};

        this.filteredSalaries.forEach(s => {
            departmentTotals[s.department] = (departmentTotals[s.department] || 0) + s.netPay;
        });

        const labels = Object.keys(departmentTotals).map(key => this.getDepartmentLabel(key));
        const data = Object.values(departmentTotals);

        const colors = [
            '#3B82F6', '#22C55E', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#06B6D4'
        ];

        this.departmentChartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                hoverBackgroundColor: colors.slice(0, data.length).map(c => c + 'CC')
            }]
        };
    }

    updateStructureChart() {
        let totalBase = 0;
        let totalBonuses = 0;
        let totalPremiums = 0;

        this.filteredSalaries.forEach(s => {
            totalBase += s.baseSalary;
            totalBonuses += s.seniorityBonus + s.qualificationBonus + s.hazardBonus + s.otherBonuses;
            totalPremiums += s.premium;
        });

        this.structureChartData = {
            labels: [
                this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_SALARY'),
                this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_ALLOWANCES'),
                this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_PREMIUMS')
            ],
            datasets: [{
                data: [totalBase, totalBonuses, totalPremiums],
                backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B'],
                hoverBackgroundColor: ['#2563EB', '#16A34A', '#D97706'],
                borderWidth: 0
            }]
        };
    }

    updateDeductionsChart() {
        let totalIncomeTax = 0;
        let totalPensionFund = 0;
        let totalOtherDeductions = 0;

        this.filteredSalaries.forEach(s => {
            totalIncomeTax += s.incomeTax;
            totalPensionFund += s.pensionFund;
            totalOtherDeductions += s.otherDeductions;
        });

        this.deductionsChartData = {
            labels: [
                this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_INCOME_TAX'),
                this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_PENSION_FUND'),
                this.translate.instant('FINANCIAL_BLOCK.SALARY.CHART_OTHER_DEDUCTIONS')
            ],
            datasets: [{
                data: [totalIncomeTax, totalPensionFund, totalOtherDeductions],
                backgroundColor: ['#EF4444', '#F59E0B', '#6B7280'],
                hoverBackgroundColor: ['#DC2626', '#D97706', '#4B5563'],
                borderWidth: 0
            }]
        };
    }
}
