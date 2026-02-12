import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { ProgressBar } from 'primeng/progressbar';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { SalaryService } from '@/core/services/salary.service';
import { Salary, EmployeeSalaryStructure, EmployeeBonus, EmployeeDeduction, BatchCalculationResult, SALARY_STATUSES, SalaryStatus } from '@/core/interfaces/hrm/salary';

@Component({
    selector: 'app-salary-management',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonDirective, IconField, InputIcon, InputText, ReactiveFormsModule, FormsModule, DeleteConfirmationComponent, Tooltip, Tag, Card, Dialog, ProgressBar, TranslateModule],
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

    // Period selection
    selectedMonth: number = new Date().getMonth() + 1;
    selectedYear: number = new Date().getFullYear();

    // Данные о зарплатных структурах сотрудников
    employeeSalaryStructures: EmployeeSalaryStructure[] = [];

    // Данные о бонусах сотрудников
    employeeBonuses: EmployeeBonus[] = [];

    // Вычеты сотрудников
    employeeDeductions: EmployeeDeduction[] = [];

    months = [
        { id: 1, name: 'Январь' },
        { id: 2, name: 'Февраль' },
        { id: 3, name: 'Март' },
        { id: 4, name: 'Апрель' },
        { id: 5, name: 'Май' },
        { id: 6, name: 'Июнь' },
        { id: 7, name: 'Июль' },
        { id: 8, name: 'Август' },
        { id: 9, name: 'Сентябрь' },
        { id: 10, name: 'Октябрь' },
        { id: 11, name: 'Ноябрь' },
        { id: 12, name: 'Декабрь' }
    ];
    years = Array.from({ length: 5 }, (_, i) => ({ id: new Date().getFullYear() - i, name: (new Date().getFullYear() - i).toString() }));

    salaryStatuses = SALARY_STATUSES.map((s) => ({ id: s.value, name: s.label }));

    // Last batch calculation result
    lastBatchResult: BatchCalculationResult | null = null;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private salaryService = inject(SalaryService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.rejectionForm = this.fb.group({
            rejection_reason: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadAllData();
    }

    private loadAllData(): void {
        this.loading = true;

        forkJoin({
            structures: this.salaryService.getSalaryStructures(),
            bonuses: this.salaryService.getBonuses(),
            deductions: this.salaryService.getDeductions()
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.employeeSalaryStructures = data.structures;
                    this.employeeBonuses = data.bonuses;
                    this.employeeDeductions = data.deductions;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Ошибка загрузки данных:', err);
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные' });
                    this.loading = false;
                }
            });
    }

    // ==================== SALARY CALCULATION ====================

    calculateAllSalaries(): void {
        this.displayBatchDialog = true;
        this.calculating = true;
        this.calculationProgress = 0;
        this.lastBatchResult = null;

        this.salaryService
            .calculateSalary(this.selectedMonth, this.selectedYear)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.calculating = false;
                    this.calculationProgress = 100;
                    this.lastBatchResult = result;
                    this.salaries = result.results.filter((r) => r.success && r.salary).map((r) => r.salary!);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Расчёт завершён',
                        detail: `Рассчитано ${result.successful} из ${result.total} зарплат`
                    });
                },
                error: (err) => {
                    this.calculating = false;
                    console.error('Ошибка расчёта:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось выполнить расчёт зарплат'
                    });
                }
            });
    }

    // ==================== APPROVAL WORKFLOW ====================

    submitForApproval(salary: Salary): void {
        const index = this.salaries.findIndex((s) => s.id === salary.id);
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
        this.salaries = this.salaries.map((s) => {
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

        const index = this.salaries.findIndex((s) => s.id === this.selectedSalary!.id);
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
        this.salaries = this.salaries.map((s) => {
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

        const index = this.salaries.findIndex((s) => s.id === this.selectedSalary!.id);
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
        const index = this.salaries.findIndex((s) => s.id === salary.id);
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
        this.salaries = this.salaries.map((s) => {
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

        this.salaries = this.salaries.filter((s) => s.id !== this.selectedSalary!.id);
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
        this.salaries = [];
        this.lastBatchResult = null;
    }

    exportPayslips(): void {
        this.salaryService
            .exportPayslips(this.selectedMonth, this.selectedYear)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = window.document.createElement('a');
                    link.href = url;
                    link.download = `payslips_${this.selectedYear}_${this.selectedMonth}.pdf`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Экспорт',
                        detail: 'Расчётные листы экспортированы'
                    });
                },
                error: (err) => {
                    console.error('Ошибка экспорта:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось экспортировать расчётные листы'
                    });
                }
            });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'paid':
                return 'success';
            case 'approved':
                return 'info';
            case 'pending_approval':
                return 'warn';
            case 'calculated':
                return 'secondary';
            case 'rejected':
                return 'danger';
            case 'draft':
                return 'contrast';
            default:
                return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.salaryStatuses.find((s) => s.id === status);
        return found ? found.name : status;
    }

    getMonthLabel(month: number): string {
        const found = this.months.find((m) => m.id === month);
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
        return this.salaries.filter((s) => s.status === 'calculated').length;
    }

    get pendingApprovalCount(): number {
        return this.salaries.filter((s) => s.status === 'pending_approval').length;
    }

    get approvedCount(): number {
        return this.salaries.filter((s) => s.status === 'approved').length;
    }

    get paidCount(): number {
        return this.salaries.filter((s) => s.status === 'paid').length;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
