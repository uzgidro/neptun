import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import {
    Vacation,
    VacationBalance,
    VacationValidationResult,
    VacationValidationError,
    VacationValidationWarning,
    VACATION_TYPES,
    VACATION_STATUSES,
    BALANCE_REQUIRED_TYPES
} from '@/core/interfaces/hrm/vacation';

interface Employee {
    id: number;
    name: string;
    department_id: number;
    department_name: string;
    manager_id?: number;
}

@Component({
    selector: 'app-vacation-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        ButtonLabel,
        ButtonIcon,
        ReactiveFormsModule,
        SelectComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        Tooltip,
        Tag,
        DialogComponent,
        TextareaComponent,
        Card,
        Dialog
    ],
    templateUrl: './vacation-management.component.html',
    styleUrl: './vacation-management.component.scss'
})
export class VacationManagementComponent implements OnInit, OnDestroy {
    vacations: Vacation[] = [];
    leaveBalances: VacationBalance[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    displayApprovalDialog: boolean = false;
    displayRejectionDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedVacation: Vacation | null = null;
    selectedEmployeeBalance: VacationBalance | null = null;
    vacationForm: FormGroup;
    rejectionForm: FormGroup;
    private nextId = 100;

    // Validation results
    validationResult: VacationValidationResult | null = null;
    overlappingVacations: Vacation[] = [];

    employees: Employee[] = [
        { id: 1, name: 'Иванов Иван Иванович', department_id: 1, department_name: 'IT отдел', manager_id: 8 },
        { id: 2, name: 'Петров Петр Петрович', department_id: 1, department_name: 'IT отдел', manager_id: 8 },
        { id: 3, name: 'Сидорова Анна Михайловна', department_id: 2, department_name: 'Бухгалтерия', manager_id: 8 },
        { id: 4, name: 'Козлов Алексей Сергеевич', department_id: 3, department_name: 'Юридический отдел', manager_id: 8 },
        { id: 5, name: 'Новикова Елена Владимировна', department_id: 4, department_name: 'Отдел продаж', manager_id: 8 },
        { id: 6, name: 'Морозов Дмитрий Александрович', department_id: 1, department_name: 'IT отдел', manager_id: 8 },
        { id: 7, name: 'Волкова Ольга Николаевна', department_id: 2, department_name: 'Бухгалтерия', manager_id: 8 },
        { id: 8, name: 'Соколов Андрей Викторович', department_id: 5, department_name: 'Администрация' }
    ];

    // Department vacation limits (max concurrent vacations)
    departmentLimits: { [key: number]: number } = {
        1: 2, // IT - max 2 concurrent
        2: 1, // Accounting - max 1 concurrent
        3: 1, // Legal - max 1 concurrent
        4: 2, // Sales - max 2 concurrent
        5: 1  // Administration - max 1 concurrent
    };

    vacationTypes = VACATION_TYPES.map(t => ({ id: t.value, name: t.label }));
    vacationStatuses = VACATION_STATUSES.map(s => ({ id: s.value, name: s.label }));

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.vacationForm = this.fb.group({
            employee_id: [null, Validators.required],
            vacation_type: [null, Validators.required],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required],
            reason: ['']
        });

        this.rejectionForm = this.fb.group({
            rejection_reason: ['', Validators.required]
        });

        // Subscribe to employee changes to update balance display
        this.vacationForm.get('employee_id')?.valueChanges.subscribe(employee => {
            if (employee) {
                this.updateSelectedEmployeeBalance(employee.id);
            } else {
                this.selectedEmployeeBalance = null;
            }
        });

        // Subscribe to date changes to validate
        this.vacationForm.get('start_date')?.valueChanges.subscribe(() => this.validateVacationRequest());
        this.vacationForm.get('end_date')?.valueChanges.subscribe(() => this.validateVacationRequest());
        this.vacationForm.get('vacation_type')?.valueChanges.subscribe(() => this.validateVacationRequest());
    }

    ngOnInit() {
        this.loadMockData();
    }

    private loadMockData(): void {
        setTimeout(() => {
            // Load leave balances
            this.leaveBalances = [
                { id: 1, employee_id: 1, employee_name: 'Иванов Иван Иванович', year: 2025, total_days: 28, used_days: 14, pending_days: 0, remaining_days: 14, carried_over_days: 0 },
                { id: 2, employee_id: 2, employee_name: 'Петров Петр Петрович', year: 2025, total_days: 28, used_days: 6, pending_days: 0, remaining_days: 22, carried_over_days: 0 },
                { id: 3, employee_id: 3, employee_name: 'Сидорова Анна Михайловна', year: 2025, total_days: 28, used_days: 0, pending_days: 21, remaining_days: 7, carried_over_days: 0 },
                { id: 4, employee_id: 4, employee_name: 'Козлов Алексей Сергеевич', year: 2025, total_days: 28, used_days: 3, pending_days: 0, remaining_days: 25, carried_over_days: 0 },
                { id: 5, employee_id: 5, employee_name: 'Новикова Елена Владимировна', year: 2025, total_days: 28, used_days: 0, pending_days: 0, remaining_days: 28, carried_over_days: 0 },
                { id: 6, employee_id: 6, employee_name: 'Морозов Дмитрий Александрович', year: 2025, total_days: 28, used_days: 7, pending_days: 0, remaining_days: 21, carried_over_days: 0 },
                { id: 7, employee_id: 7, employee_name: 'Волкова Ольга Николаевна', year: 2025, total_days: 28, used_days: 10, pending_days: 0, remaining_days: 18, carried_over_days: 0 },
                { id: 8, employee_id: 8, employee_name: 'Соколов Андрей Викторович', year: 2025, total_days: 35, used_days: 0, pending_days: 0, remaining_days: 35, carried_over_days: 7 }
            ];

            // Load vacations
            this.vacations = [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'Иванов Иван Иванович',
                    department_id: 1,
                    department_name: 'IT отдел',
                    vacation_type: 'annual',
                    start_date: '2025-07-01',
                    end_date: '2025-07-14',
                    days_count: 14,
                    status: 'approved',
                    approver_id: 8,
                    approver_name: 'Соколов Андрей Викторович',
                    approved_at: '2025-01-15'
                },
                {
                    id: 2,
                    employee_id: 2,
                    employee_name: 'Петров Петр Петрович',
                    department_id: 1,
                    department_name: 'IT отдел',
                    vacation_type: 'sick',
                    start_date: '2025-01-15',
                    end_date: '2025-01-20',
                    days_count: 6,
                    status: 'approved',
                    approver_id: 8,
                    approver_name: 'Соколов Андрей Викторович'
                },
                {
                    id: 3,
                    employee_id: 3,
                    employee_name: 'Сидорова Анна Михайловна',
                    department_id: 2,
                    department_name: 'Бухгалтерия',
                    vacation_type: 'annual',
                    start_date: '2025-08-01',
                    end_date: '2025-08-21',
                    days_count: 21,
                    status: 'pending',
                    reason: 'Запланированный летний отпуск'
                },
                {
                    id: 4,
                    employee_id: 4,
                    employee_name: 'Козлов Алексей Сергеевич',
                    department_id: 3,
                    department_name: 'Юридический отдел',
                    vacation_type: 'unpaid',
                    start_date: '2025-02-10',
                    end_date: '2025-02-12',
                    days_count: 3,
                    status: 'rejected',
                    rejection_reason: 'Высокая загрузка в связи с подготовкой квартального отчета'
                },
                {
                    id: 5,
                    employee_id: 6,
                    employee_name: 'Морозов Дмитрий Александрович',
                    department_id: 1,
                    department_name: 'IT отдел',
                    vacation_type: 'annual',
                    start_date: '2025-07-05',
                    end_date: '2025-07-18',
                    days_count: 14,
                    status: 'pending',
                    reason: 'Летний отпуск'
                }
            ];
            this.loading = false;
        }, 500);
    }

    private updateSelectedEmployeeBalance(employeeId: number): void {
        this.selectedEmployeeBalance = this.leaveBalances.find(b => b.employee_id === employeeId) || null;
    }

    private validateVacationRequest(): void {
        const formValue = this.vacationForm.value;
        if (!formValue.employee_id || !formValue.start_date || !formValue.end_date || !formValue.vacation_type) {
            this.validationResult = null;
            this.overlappingVacations = [];
            return;
        }

        const errors: VacationValidationError[] = [];
        const warnings: VacationValidationWarning[] = [];

        const startDate = new Date(formValue.start_date);
        const endDate = new Date(formValue.end_date);
        const daysRequested = this.calculateDays(startDate, endDate);
        const employeeId = formValue.employee_id.id;
        const employee = this.employees.find(e => e.id === employeeId);
        const vacationType = formValue.vacation_type.id;

        // 1. Validate dates
        if (startDate > endDate) {
            errors.push({
                code: 'INVALID_DATES',
                message: 'Дата начала не может быть позже даты окончания'
            });
        }

        // 2. Check leave balance for types that require it
        if (BALANCE_REQUIRED_TYPES.includes(vacationType)) {
            const balance = this.leaveBalances.find(b => b.employee_id === employeeId);
            if (balance) {
                const availableDays = balance.remaining_days;
                if (daysRequested > availableDays) {
                    errors.push({
                        code: 'INSUFFICIENT_BALANCE',
                        message: `Недостаточно дней отпуска. Запрошено: ${daysRequested}, доступно: ${availableDays}`,
                        details: { requested: daysRequested, available: availableDays }
                    });
                }
            }
        }

        // 3. Check for personal overlapping vacations (same employee)
        const personalOverlap = this.vacations.find(v =>
            v.employee_id === employeeId &&
            v.id !== this.selectedVacation?.id &&
            ['pending', 'approved'].includes(v.status) &&
            this.datesOverlap(startDate, endDate, new Date(v.start_date), new Date(v.end_date))
        );

        if (personalOverlap) {
            errors.push({
                code: 'DATE_OVERLAP',
                message: `У вас уже есть отпуск в этот период (${personalOverlap.start_date} - ${personalOverlap.end_date})`
            });
        }

        // 4. Check department vacation limit
        if (employee) {
            const departmentVacations = this.vacations.filter(v =>
                v.department_id === employee.department_id &&
                v.employee_id !== employeeId &&
                v.id !== this.selectedVacation?.id &&
                ['pending', 'approved'].includes(v.status) &&
                this.datesOverlap(startDate, endDate, new Date(v.start_date), new Date(v.end_date))
            );

            const maxConcurrent = this.departmentLimits[employee.department_id] || 2;

            if (departmentVacations.length >= maxConcurrent) {
                errors.push({
                    code: 'DEPARTMENT_LIMIT',
                    message: `Превышен лимит одновременных отпусков в отделе (макс. ${maxConcurrent})`
                });
            }

            // Warning about department overlaps
            if (departmentVacations.length > 0) {
                const overlappingNames = departmentVacations.map(v => v.employee_name);
                warnings.push({
                    code: 'DEPARTMENT_OVERLAP',
                    message: `В этот период в отпуске будут: ${overlappingNames.join(', ')}`,
                    overlappingEmployees: overlappingNames
                });
                this.overlappingVacations = departmentVacations;
            } else {
                this.overlappingVacations = [];
            }
        }

        // 5. Short notice warning (less than 14 days)
        const today = new Date();
        const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilStart < 14 && daysUntilStart > 0) {
            warnings.push({
                code: 'SHORT_NOTICE',
                message: `Заявка подается менее чем за 14 дней до начала отпуска`
            });
        }

        this.validationResult = {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    private datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
        return start1 <= end2 && end1 >= start2;
    }

    private calculateDays(startDate: Date, endDate: Date): number {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedVacation = null;
        this.submitted = false;
        this.validationResult = null;
        this.overlappingVacations = [];
        this.selectedEmployeeBalance = null;
        this.vacationForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(vacation: Vacation): void {
        if (vacation.status !== 'draft' && vacation.status !== 'pending') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Редактировать можно только черновики и заявки на согласовании'
            });
            return;
        }

        this.isEditMode = true;
        this.selectedVacation = vacation;
        this.submitted = false;
        this.vacationForm.reset();

        const selectedEmployee = this.employees.find(e => e.id === vacation.employee_id);
        const selectedType = this.vacationTypes.find(t => t.id === vacation.vacation_type);

        this.vacationForm.patchValue({
            employee_id: selectedEmployee ? { id: selectedEmployee.id, name: selectedEmployee.name } : null,
            vacation_type: selectedType || null,
            start_date: vacation.start_date ? new Date(vacation.start_date) : null,
            end_date: vacation.end_date ? new Date(vacation.end_date) : null,
            reason: vacation.reason || ''
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedVacation = null;
        this.validationResult = null;
        this.overlappingVacations = [];
    }

    onSubmit() {
        this.submitted = true;
        if (this.vacationForm.invalid) return;

        // Revalidate before submit
        this.validateVacationRequest();
        if (this.validationResult && !this.validationResult.isValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Ошибка валидации',
                detail: this.validationResult.errors[0]?.message || 'Проверьте данные заявки'
            });
            return;
        }

        if (this.isEditMode && this.selectedVacation) {
            this.updateVacation();
        } else {
            this.createVacation();
        }
    }

    // Submit vacation for approval
    submitForApproval(vacation: Vacation): void {
        if (vacation.status !== 'draft') {
            return;
        }

        // Validate before submitting
        const employee = this.employees.find(e => e.id === vacation.employee_id);
        if (employee && BALANCE_REQUIRED_TYPES.includes(vacation.vacation_type)) {
            const balance = this.leaveBalances.find(b => b.employee_id === vacation.employee_id);
            if (balance && vacation.days_count > balance.remaining_days) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка',
                    detail: `Недостаточно дней отпуска. Запрошено: ${vacation.days_count}, доступно: ${balance.remaining_days}`
                });
                return;
            }
        }

        const index = this.vacations.findIndex(v => v.id === vacation.id);
        if (index !== -1) {
            this.vacations[index] = { ...this.vacations[index], status: 'pending' };
            this.vacations = [...this.vacations];

            // Update pending days in balance
            this.updatePendingDays(vacation.employee_id, vacation.days_count, 'add');

            this.messageService.add({
                severity: 'success',
                summary: 'Отправлено',
                detail: 'Заявка отправлена на согласование руководителю'
            });
        }
    }

    private createVacation() {
        const formValue = this.vacationForm.value;
        const startDate = new Date(formValue.start_date);
        const endDate = new Date(formValue.end_date);
        const daysCount = this.calculateDays(startDate, endDate);
        const employee = this.employees.find(e => e.id === formValue.employee_id.id);

        const newVacation: Vacation = {
            id: this.nextId++,
            employee_id: formValue.employee_id.id,
            employee_name: formValue.employee_id.name,
            department_id: employee?.department_id,
            department_name: employee?.department_name,
            vacation_type: formValue.vacation_type.id,
            start_date: this.dateToYMD(startDate),
            end_date: this.dateToYMD(endDate),
            days_count: daysCount,
            status: 'pending', // Directly submit for approval
            reason: formValue.reason,
            created_at: new Date().toISOString()
        };

        this.vacations = [...this.vacations, newVacation];

        // Update pending days in balance
        if (BALANCE_REQUIRED_TYPES.includes(newVacation.vacation_type)) {
            this.updatePendingDays(newVacation.employee_id, daysCount, 'add');
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Заявка на отпуск создана и отправлена на согласование'
        });
        this.closeDialog();
    }

    private updateVacation() {
        if (!this.selectedVacation) return;

        const formValue = this.vacationForm.value;
        const startDate = new Date(formValue.start_date);
        const endDate = new Date(formValue.end_date);
        const newDaysCount = this.calculateDays(startDate, endDate);
        const oldDaysCount = this.selectedVacation.days_count;
        const employee = this.employees.find(e => e.id === formValue.employee_id.id);

        const index = this.vacations.findIndex(v => v.id === this.selectedVacation!.id);
        if (index !== -1) {
            // Update pending days difference
            if (BALANCE_REQUIRED_TYPES.includes(formValue.vacation_type.id)) {
                const daysDiff = newDaysCount - oldDaysCount;
                if (daysDiff !== 0) {
                    this.updatePendingDays(formValue.employee_id.id, Math.abs(daysDiff), daysDiff > 0 ? 'add' : 'subtract');
                }
            }

            this.vacations[index] = {
                ...this.vacations[index],
                employee_id: formValue.employee_id.id,
                employee_name: formValue.employee_id.name,
                department_id: employee?.department_id,
                department_name: employee?.department_name,
                vacation_type: formValue.vacation_type.id,
                start_date: this.dateToYMD(startDate),
                end_date: this.dateToYMD(endDate),
                days_count: newDaysCount,
                reason: formValue.reason,
                updated_at: new Date().toISOString()
            };
            this.vacations = [...this.vacations];
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Заявка обновлена' });
        this.closeDialog();
    }

    // Open approval confirmation dialog
    openApprovalDialog(vacation: Vacation): void {
        this.selectedVacation = vacation;
        this.displayApprovalDialog = true;
    }

    // Approve vacation
    confirmApproval(): void {
        if (!this.selectedVacation) return;

        const vacation = this.selectedVacation;
        const index = this.vacations.findIndex(v => v.id === vacation.id);

        if (index !== -1) {
            // Update vacation status
            this.vacations[index] = {
                ...this.vacations[index],
                status: 'approved',
                approver_id: 8, // Current user (mock)
                approver_name: 'Соколов Андрей Викторович',
                approved_at: new Date().toISOString()
            };
            this.vacations = [...this.vacations];

            // Update leave balance: move from pending to used
            if (BALANCE_REQUIRED_TYPES.includes(vacation.vacation_type)) {
                this.updateBalanceOnApproval(vacation.employee_id, vacation.days_count);
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Одобрено',
                detail: `Отпуск сотрудника ${vacation.employee_name} одобрен. Даты заблокированы в календаре.`
            });
        }

        this.displayApprovalDialog = false;
        this.selectedVacation = null;
    }

    // Open rejection dialog
    openRejectionDialog(vacation: Vacation): void {
        this.selectedVacation = vacation;
        this.rejectionForm.reset();
        this.displayRejectionDialog = true;
    }

    // Reject vacation with reason
    confirmRejection(): void {
        if (!this.selectedVacation || this.rejectionForm.invalid) return;

        const vacation = this.selectedVacation;
        const rejectionReason = this.rejectionForm.value.rejection_reason;
        const index = this.vacations.findIndex(v => v.id === vacation.id);

        if (index !== -1) {
            // Update vacation status
            this.vacations[index] = {
                ...this.vacations[index],
                status: 'rejected',
                rejection_reason: rejectionReason
            };
            this.vacations = [...this.vacations];

            // Return pending days to balance
            if (BALANCE_REQUIRED_TYPES.includes(vacation.vacation_type)) {
                this.updatePendingDays(vacation.employee_id, vacation.days_count, 'subtract');
            }

            this.messageService.add({
                severity: 'warn',
                summary: 'Отклонено',
                detail: `Заявка отклонена. Сотрудник ${vacation.employee_name} уведомлен.`
            });
        }

        this.displayRejectionDialog = false;
        this.selectedVacation = null;
    }

    // Cancel vacation (by employee)
    cancelVacation(vacation: Vacation): void {
        if (!['draft', 'pending'].includes(vacation.status)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Отменить можно только черновики и заявки на согласовании'
            });
            return;
        }

        const index = this.vacations.findIndex(v => v.id === vacation.id);
        if (index !== -1) {
            this.vacations[index] = { ...this.vacations[index], status: 'cancelled' };
            this.vacations = [...this.vacations];

            // Return pending days if was pending
            if (vacation.status === 'pending' && BALANCE_REQUIRED_TYPES.includes(vacation.vacation_type)) {
                this.updatePendingDays(vacation.employee_id, vacation.days_count, 'subtract');
            }

            this.messageService.add({
                severity: 'info',
                summary: 'Отменено',
                detail: 'Заявка на отпуск отменена'
            });
        }
    }

    private updatePendingDays(employeeId: number, days: number, operation: 'add' | 'subtract'): void {
        const balanceIndex = this.leaveBalances.findIndex(b => b.employee_id === employeeId);
        if (balanceIndex !== -1) {
            const balance = this.leaveBalances[balanceIndex];
            if (operation === 'add') {
                balance.pending_days += days;
                balance.remaining_days -= days;
            } else {
                balance.pending_days -= days;
                balance.remaining_days += days;
            }
            this.leaveBalances = [...this.leaveBalances];

            // Update selected employee balance if needed
            if (this.selectedEmployeeBalance?.employee_id === employeeId) {
                this.selectedEmployeeBalance = balance;
            }
        }
    }

    private updateBalanceOnApproval(employeeId: number, days: number): void {
        const balanceIndex = this.leaveBalances.findIndex(b => b.employee_id === employeeId);
        if (balanceIndex !== -1) {
            const balance = this.leaveBalances[balanceIndex];
            balance.pending_days -= days;
            balance.used_days += days;
            this.leaveBalances = [...this.leaveBalances];
        }
    }

    openDeleteDialog(vacation: Vacation): void {
        this.selectedVacation = vacation;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedVacation) return;

        const vacation = this.selectedVacation;

        // Return days if pending
        if (vacation.status === 'pending' && BALANCE_REQUIRED_TYPES.includes(vacation.vacation_type)) {
            this.updatePendingDays(vacation.employee_id, vacation.days_count, 'subtract');
        }

        this.vacations = this.vacations.filter(v => v.id !== vacation.id);
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Заявка удалена' });
        this.displayDeleteDialog = false;
        this.selectedVacation = null;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warn';
            case 'rejected': return 'danger';
            case 'cancelled': return 'secondary';
            case 'draft': return 'info';
            default: return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.vacationStatuses.find(s => s.id === status);
        return found ? found.name : status;
    }

    getTypeLabel(type: string): string {
        const found = this.vacationTypes.find(t => t.id === type);
        return found ? found.name : type;
    }

    getEmployeeBalance(employeeId: number): VacationBalance | undefined {
        return this.leaveBalances.find(b => b.employee_id === employeeId);
    }

    get pendingCount(): number {
        return this.vacations.filter(v => v.status === 'pending').length;
    }

    get approvedCount(): number {
        return this.vacations.filter(v => v.status === 'approved').length;
    }

    get rejectedCount(): number {
        return this.vacations.filter(v => v.status === 'rejected').length;
    }

    private dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
