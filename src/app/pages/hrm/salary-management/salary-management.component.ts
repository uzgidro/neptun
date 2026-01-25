import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { ProgressBar } from 'primeng/progressbar';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import {
    Salary,
    EmployeeSalaryStructure,
    EmployeeAttendance,
    EmployeeBonus,
    EmployeeDeduction,
    BatchCalculationResult,
    DEFAULT_TAX_RATES,
    SALARY_STATUSES,
    SalaryStatus
} from '@/core/interfaces/hrm/salary';

@Component({
    selector: 'app-salary-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        ReactiveFormsModule,
        FormsModule,
        DeleteConfirmationComponent,
        Tooltip,
        Tag,
        Card,
        Dialog,
        ProgressBar
    ],
    templateUrl: './salary-management.component.html',
    styleUrl: './salary-management.component.scss'
})
export class SalaryManagementComponent implements OnInit, OnDestroy {
    salaries: Salary[] = [];
    loading: boolean = true;
    calculating: boolean = false;
    calculationProgress: number = 0;

    displayDetailDialog: boolean = false;
    displayApprovalDialog: boolean = false;
    displayRejectionDialog: boolean = false;
    displayBatchDialog: boolean = false;
    displayDeleteDialog: boolean = false;

    selectedSalary: Salary | null = null;
    rejectionForm: FormGroup;
    private nextId = 100;

    // Period selection
    selectedMonth: number = new Date().getMonth() + 1;
    selectedYear: number = new Date().getFullYear();

    // Mock data for employees with salary structure
    employeeSalaryStructures: EmployeeSalaryStructure[] = [
        { id: 1, employee_id: 1, employee_name: 'Иванов Иван Иванович', department_id: 1, department_name: 'IT отдел', position_id: 1, position_name: 'Старший разработчик', base_salary: 15000000, rank_allowance: 2000000, education_allowance: 1500000, seniority_allowance: 1000000, seniority_years: 5, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 2, employee_id: 2, employee_name: 'Петров Петр Петрович', department_id: 1, department_name: 'IT отдел', position_id: 2, position_name: 'Разработчик', base_salary: 12000000, rank_allowance: 1500000, education_allowance: 1000000, seniority_allowance: 600000, seniority_years: 3, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 3, employee_id: 3, employee_name: 'Сидорова Анна Михайловна', department_id: 2, department_name: 'Бухгалтерия', position_id: 3, position_name: 'Главный бухгалтер', base_salary: 14000000, rank_allowance: 2500000, education_allowance: 1500000, seniority_allowance: 1400000, seniority_years: 7, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 4, employee_id: 4, employee_name: 'Козлов Алексей Сергеевич', department_id: 3, department_name: 'Юридический отдел', position_id: 4, position_name: 'Юрист', base_salary: 18000000, rank_allowance: 3000000, education_allowance: 2000000, seniority_allowance: 1800000, seniority_years: 9, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 5, employee_id: 5, employee_name: 'Новикова Елена Владимировна', department_id: 4, department_name: 'Отдел продаж', position_id: 5, position_name: 'Менеджер по продажам', base_salary: 11000000, rank_allowance: 1000000, education_allowance: 500000, seniority_allowance: 200000, seniority_years: 1, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 6, employee_id: 6, employee_name: 'Морозов Дмитрий Александрович', department_id: 1, department_name: 'IT отдел', position_id: 6, position_name: 'DevOps инженер', base_salary: 16000000, rank_allowance: 2000000, education_allowance: 1500000, seniority_allowance: 800000, seniority_years: 4, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 7, employee_id: 7, employee_name: 'Волкова Ольга Николаевна', department_id: 2, department_name: 'Бухгалтерия', position_id: 7, position_name: 'Бухгалтер', base_salary: 8500000, rank_allowance: 800000, education_allowance: 500000, seniority_allowance: 400000, seniority_years: 2, effective_date: '2024-01-01', currency: 'UZS' },
        { id: 8, employee_id: 8, employee_name: 'Соколов Андрей Викторович', department_id: 5, department_name: 'Администрация', position_id: 8, position_name: 'Генеральный директор', base_salary: 25000000, rank_allowance: 5000000, education_allowance: 3000000, seniority_allowance: 2500000, seniority_years: 10, effective_date: '2024-01-01', currency: 'UZS' }
    ];

    // Mock attendance data
    employeeAttendance: EmployeeAttendance[] = [];

    // Mock bonuses
    employeeBonuses: EmployeeBonus[] = [];

    // Mock deductions
    employeeDeductions: EmployeeDeduction[] = [
        { id: 1, employee_id: 2, deduction_type: 'loan', amount: 500000, is_percentage: false, start_date: '2024-01-01', end_date: '2025-12-31', description: 'Ипотечный кредит', is_active: true },
        { id: 2, employee_id: 4, deduction_type: 'alimony', amount: 25, is_percentage: true, start_date: '2023-06-01', description: 'Алименты 25%', is_active: true },
        { id: 3, employee_id: 5, deduction_type: 'advance', amount: 2000000, is_percentage: false, start_date: '2025-01-01', end_date: '2025-01-31', description: 'Аванс за январь', is_active: true }
    ];

    months = [
        { id: 1, name: 'Январь' }, { id: 2, name: 'Февраль' }, { id: 3, name: 'Март' },
        { id: 4, name: 'Апрель' }, { id: 5, name: 'Май' }, { id: 6, name: 'Июнь' },
        { id: 7, name: 'Июль' }, { id: 8, name: 'Август' }, { id: 9, name: 'Сентябрь' },
        { id: 10, name: 'Октябрь' }, { id: 11, name: 'Ноябрь' }, { id: 12, name: 'Декабрь' }
    ];
    years = Array.from({ length: 5 }, (_, i) => ({ id: new Date().getFullYear() - i, name: (new Date().getFullYear() - i).toString() }));

    salaryStatuses = SALARY_STATUSES.map(s => ({ id: s.value, name: s.label }));
    taxRates = DEFAULT_TAX_RATES;

    // Last batch calculation result
    lastBatchResult: BatchCalculationResult | null = null;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.rejectionForm = this.fb.group({
            rejection_reason: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.generateAttendanceData();
        this.generateBonusData();
        this.loadSalaries();
    }

    private generateAttendanceData(): void {
        // Generate attendance data for current period
        const workingDays = this.getWorkingDaysInMonth(this.selectedMonth, this.selectedYear);

        this.employeeAttendance = this.employeeSalaryStructures.map(emp => ({
            employee_id: emp.employee_id,
            period_month: this.selectedMonth,
            period_year: this.selectedYear,
            working_days: workingDays,
            worked_days: workingDays - Math.floor(Math.random() * 3), // Random 0-2 days absent
            sick_days: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
            vacation_days: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
            absent_days: Math.random() > 0.95 ? 1 : 0,
            overtime_hours: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0,
            late_minutes: Math.floor(Math.random() * 60)
        }));
    }

    private generateBonusData(): void {
        // Generate random bonuses for some employees
        this.employeeBonuses = [
            { id: 1, employee_id: 1, bonus_type: 'performance', amount: 3000000, period_month: this.selectedMonth, period_year: this.selectedYear, description: 'Премия за выполнение проекта', approved: true },
            { id: 2, employee_id: 3, bonus_type: 'quarterly', amount: 2500000, period_month: this.selectedMonth, period_year: this.selectedYear, description: 'Квартальная премия', approved: true },
            { id: 3, employee_id: 6, bonus_type: 'performance', amount: 2000000, period_month: this.selectedMonth, period_year: this.selectedYear, description: 'Премия за внедрение CI/CD', approved: true },
            { id: 4, employee_id: 8, bonus_type: 'annual', amount: 10000000, period_month: this.selectedMonth, period_year: this.selectedYear, description: 'Годовой бонус', approved: true }
        ];
    }

    private loadSalaries(): void {
        setTimeout(() => {
            // Load existing salaries for selected period
            this.salaries = [];
            this.loading = false;
        }, 500);
    }

    private getWorkingDaysInMonth(month: number, year: number): number {
        // Simplified calculation - actual should consider holidays
        const daysInMonth = new Date(year, month, 0).getDate();
        let workingDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
        }
        return workingDays;
    }

    // ==================== SALARY CALCULATION ====================

    calculateAllSalaries(): void {
        this.displayBatchDialog = true;
        this.calculating = true;
        this.calculationProgress = 0;
        this.lastBatchResult = null;

        const employees = this.employeeSalaryStructures;
        const total = employees.length;
        let processed = 0;
        let successful = 0;
        let failed = 0;
        const results: Salary[] = [];

        // Simulate async calculation
        const calculateNext = (index: number) => {
            if (index >= total) {
                // Calculation complete
                this.calculating = false;
                this.salaries = results;

                const totalGross = results.reduce((sum, s) => sum + s.gross_salary, 0);
                const totalNet = results.reduce((sum, s) => sum + s.net_salary, 0);
                const totalTaxes = results.reduce((sum, s) => sum + s.income_tax + s.social_fund + s.pension_fund + s.health_insurance, 0);

                this.lastBatchResult = {
                    total,
                    successful,
                    failed,
                    results: results.map(s => ({ success: true, salary: s })),
                    total_gross: totalGross,
                    total_net: totalNet,
                    total_taxes: totalTaxes
                };

                this.messageService.add({
                    severity: 'success',
                    summary: 'Расчёт завершён',
                    detail: `Рассчитано ${successful} из ${total} зарплат`
                });
                return;
            }

            setTimeout(() => {
                const employee = employees[index];
                const salary = this.calculateSalaryForEmployee(employee);

                if (salary) {
                    results.push(salary);
                    successful++;
                } else {
                    failed++;
                }

                processed++;
                this.calculationProgress = Math.round((processed / total) * 100);
                calculateNext(index + 1);
            }, 200); // Simulate processing time
        };

        calculateNext(0);
    }

    calculateSalaryForEmployee(empStructure: EmployeeSalaryStructure): Salary | null {
        const attendance = this.employeeAttendance.find(a =>
            a.employee_id === empStructure.employee_id &&
            a.period_month === this.selectedMonth &&
            a.period_year === this.selectedYear
        );

        if (!attendance) {
            return null;
        }

        // 1. Calculate allowances
        const rankAllowance = empStructure.rank_allowance;
        const educationAllowance = empStructure.education_allowance;
        const seniorityAllowance = empStructure.seniority_allowance;
        const otherAllowances = 0;

        // 2. Get bonuses for this period
        const bonuses = this.employeeBonuses
            .filter(b => b.employee_id === empStructure.employee_id &&
                         b.period_month === this.selectedMonth &&
                         b.period_year === this.selectedYear &&
                         b.approved)
            .reduce((sum, b) => sum + b.amount, 0);

        // 3. Calculate overtime pay (1.5x hourly rate)
        const hourlyRate = empStructure.base_salary / (attendance.working_days * 8);
        const overtimePay = Math.round(attendance.overtime_hours * hourlyRate * 1.5);

        // 4. Calculate absence deduction
        const dailyRate = empStructure.base_salary / attendance.working_days;
        const absenceDeduction = Math.round(attendance.absent_days * dailyRate);

        // 5. Calculate Gross Salary
        const grossSalary = empStructure.base_salary +
                           rankAllowance +
                           educationAllowance +
                           seniorityAllowance +
                           otherAllowances +
                           bonuses +
                           overtimePay -
                           absenceDeduction;

        // 6. Calculate taxes (based on Uzbekistan rates)
        const incomeTax = Math.round(grossSalary * this.taxRates.income_tax);
        const socialFund = Math.round(grossSalary * this.taxRates.social_fund);
        const pensionFund = Math.round(grossSalary * this.taxRates.pension_fund);
        const healthInsurance = Math.round(grossSalary * this.taxRates.health_insurance);
        const tradeUnion = Math.round(grossSalary * this.taxRates.trade_union);

        // 7. Get other deductions (loans, alimony, etc.)
        const activeDeductions = this.employeeDeductions.filter(d =>
            d.employee_id === empStructure.employee_id && d.is_active
        );

        let otherDeductions = 0;
        for (const deduction of activeDeductions) {
            if (deduction.is_percentage) {
                otherDeductions += Math.round(grossSalary * (deduction.amount / 100));
            } else {
                otherDeductions += deduction.amount;
            }
        }

        // 8. Calculate total deductions and net salary
        const totalDeductions = incomeTax + socialFund + pensionFund + healthInsurance + tradeUnion + otherDeductions;
        const netSalary = grossSalary - totalDeductions;

        const salary: Salary = {
            id: this.nextId++,
            employee_id: empStructure.employee_id,
            employee_name: empStructure.employee_name,
            department_id: empStructure.department_id,
            department_name: empStructure.department_name,
            position_name: empStructure.position_name,
            period_month: this.selectedMonth,
            period_year: this.selectedYear,

            base_salary: empStructure.base_salary,
            rank_allowance: rankAllowance,
            education_allowance: educationAllowance,
            seniority_allowance: seniorityAllowance,
            other_allowances: otherAllowances,
            bonuses: bonuses,
            overtime_pay: overtimePay,
            absence_deduction: absenceDeduction,

            gross_salary: grossSalary,

            income_tax: incomeTax,
            social_fund: socialFund,
            pension_fund: pensionFund,
            health_insurance: healthInsurance,
            trade_union: tradeUnion,
            other_deductions: otherDeductions,

            total_deductions: totalDeductions,
            net_salary: netSalary,

            working_days: attendance.working_days,
            worked_days: attendance.worked_days,
            sick_days: attendance.sick_days,
            vacation_days: attendance.vacation_days,
            absent_days: attendance.absent_days,
            overtime_hours: attendance.overtime_hours,

            status: 'calculated',
            calculated_at: new Date().toISOString(),
            calculated_by: 'Система'
        };

        return salary;
    }

    // ==================== APPROVAL WORKFLOW ====================

    submitForApproval(salary: Salary): void {
        const index = this.salaries.findIndex(s => s.id === salary.id);
        if (index !== -1) {
            this.salaries[index] = {
                ...this.salaries[index],
                status: 'pending_approval'
            };
            this.salaries = [...this.salaries];
            this.messageService.add({
                severity: 'info',
                summary: 'Отправлено',
                detail: `Зарплата ${salary.employee_name} отправлена на утверждение`
            });
        }
    }

    submitAllForApproval(): void {
        let count = 0;
        this.salaries = this.salaries.map(s => {
            if (s.status === 'calculated') {
                count++;
                return { ...s, status: 'pending_approval' as SalaryStatus };
            }
            return s;
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Отправлено',
            detail: `${count} записей отправлено на утверждение`
        });
    }

    openApprovalDialog(salary: Salary): void {
        this.selectedSalary = salary;
        this.displayApprovalDialog = true;
    }

    confirmApproval(): void {
        if (!this.selectedSalary) return;

        const index = this.salaries.findIndex(s => s.id === this.selectedSalary!.id);
        if (index !== -1) {
            this.salaries[index] = {
                ...this.salaries[index],
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: 'HR Директор'
            };
            this.salaries = [...this.salaries];
            this.messageService.add({
                severity: 'success',
                summary: 'Утверждено',
                detail: `Зарплата ${this.selectedSalary.employee_name} утверждена`
            });
        }

        this.displayApprovalDialog = false;
        this.selectedSalary = null;
    }

    approveAll(): void {
        let count = 0;
        const now = new Date().toISOString();
        this.salaries = this.salaries.map(s => {
            if (s.status === 'pending_approval') {
                count++;
                return {
                    ...s,
                    status: 'approved' as SalaryStatus,
                    approved_at: now,
                    approved_by: 'HR Директор'
                };
            }
            return s;
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Утверждено',
            detail: `${count} записей утверждено`
        });
    }

    openRejectionDialog(salary: Salary): void {
        this.selectedSalary = salary;
        this.rejectionForm.reset();
        this.displayRejectionDialog = true;
    }

    confirmRejection(): void {
        if (!this.selectedSalary || this.rejectionForm.invalid) return;

        const index = this.salaries.findIndex(s => s.id === this.selectedSalary!.id);
        if (index !== -1) {
            this.salaries[index] = {
                ...this.salaries[index],
                status: 'rejected',
                rejection_reason: this.rejectionForm.value.rejection_reason
            };
            this.salaries = [...this.salaries];
            this.messageService.add({
                severity: 'warn',
                summary: 'Отклонено',
                detail: `Зарплата ${this.selectedSalary.employee_name} отклонена`
            });
        }

        this.displayRejectionDialog = false;
        this.selectedSalary = null;
    }

    markAsPaid(salary: Salary): void {
        const index = this.salaries.findIndex(s => s.id === salary.id);
        if (index !== -1) {
            this.salaries[index] = {
                ...this.salaries[index],
                status: 'paid',
                paid_at: new Date().toISOString()
            };
            this.salaries = [...this.salaries];
            this.messageService.add({
                severity: 'success',
                summary: 'Выплачено',
                detail: `Зарплата ${salary.employee_name} отмечена как выплаченная`
            });
        }
    }

    markAllAsPaid(): void {
        let count = 0;
        const now = new Date().toISOString();
        this.salaries = this.salaries.map(s => {
            if (s.status === 'approved') {
                count++;
                return { ...s, status: 'paid' as SalaryStatus, paid_at: now };
            }
            return s;
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Выплачено',
            detail: `${count} записей отмечено как выплаченные`
        });
    }

    // ==================== DETAILS & REPORTS ====================

    openDetailDialog(salary: Salary): void {
        this.selectedSalary = salary;
        this.displayDetailDialog = true;
    }

    generatePayslip(salary: Salary): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Формирование',
            detail: `Расчётный лист для ${salary.employee_name} формируется...`
        });
        // In real app, would generate PDF
    }

    generatePayrollReport(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Формирование',
            detail: 'Реестр зарплаты формируется...'
        });
        // In real app, would generate report
    }

    generateTaxReport(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Формирование',
            detail: 'Отчёт в налоговую формируется...'
        });
    }

    generateSocialFundReport(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Формирование',
            detail: 'Отчёт в соцфонд формируется...'
        });
    }

    // ==================== DELETE ====================

    openDeleteDialog(salary: Salary): void {
        this.selectedSalary = salary;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedSalary) return;

        this.salaries = this.salaries.filter(s => s.id !== this.selectedSalary!.id);
        this.messageService.add({
            severity: 'success',
            summary: 'Удалено',
            detail: 'Запись удалена'
        });
        this.displayDeleteDialog = false;
        this.selectedSalary = null;
    }

    // ==================== HELPERS ====================

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onPeriodChange(): void {
        this.generateAttendanceData();
        this.generateBonusData();
        this.salaries = [];
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'paid': return 'success';
            case 'approved': return 'info';
            case 'pending_approval': return 'warn';
            case 'calculated': return 'secondary';
            case 'rejected': return 'danger';
            case 'draft': return 'contrast';
            default: return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.salaryStatuses.find(s => s.id === status);
        return found ? found.name : status;
    }

    getMonthLabel(month: number): string {
        const found = this.months.find(m => m.id === month);
        return found ? found.name : month.toString();
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('ru-RU').format(value);
    }

    get totalGross(): number {
        return this.salaries.reduce((sum, s) => sum + s.gross_salary, 0);
    }

    get totalNet(): number {
        return this.salaries.reduce((sum, s) => sum + s.net_salary, 0);
    }

    get totalTaxes(): number {
        return this.salaries.reduce((sum, s) => sum + s.income_tax + s.social_fund + s.pension_fund + s.health_insurance, 0);
    }

    get calculatedCount(): number {
        return this.salaries.filter(s => s.status === 'calculated').length;
    }

    get pendingApprovalCount(): number {
        return this.salaries.filter(s => s.status === 'pending_approval').length;
    }

    get approvedCount(): number {
        return this.salaries.filter(s => s.status === 'approved').length;
    }

    get paidCount(): number {
        return this.salaries.filter(s => s.status === 'paid').length;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
