import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Vacation, VacationBalance, VacationPayload, VacationValidationResult, VacationValidationError, VacationValidationWarning, VACATION_TYPES, VACATION_STATUSES, BALANCE_REQUIRED_TYPES } from '@/core/interfaces/hrm/vacation';
import { VacationService } from '@/core/services/vacation.service';
import { ContactService } from '@/core/services/contact.service';
import { Contact } from '@/core/interfaces/contact';

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
        Dialog,
        TranslateModule
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

    // Validation results
    validationResult: VacationValidationResult | null = null;
    overlappingVacations: Vacation[] = [];

    // Data from services
    employees: Employee[] = [];

    // Department vacation limits (max concurrent vacations) - can be loaded from API
    departmentLimits: { [key: number]: number } = {};

    vacationTypes = VACATION_TYPES.map((t) => ({ id: t.value, name: t.label }));
    vacationStatuses = VACATION_STATUSES.map((s) => ({ id: s.value, name: s.label }));

    private vacationService = inject(VacationService);
    private contactService = inject(ContactService);
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
        this.vacationForm.get('employee_id')?.valueChanges.subscribe((employee) => {
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
        this.loadVacations();
        this.loadVacationBalances();
        this.loadEmployees();
    }

    private loadVacations(): void {
        this.vacationService
            .getVacations()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.vacations = data;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить отпуска' });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    private loadVacationBalances(): void {
        this.vacationService
            .getVacationBalances()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.leaveBalances = data;
                },
                error: (err) => console.error(err)
            });
    }

    private loadEmployees(): void {
        this.contactService
            .getContacts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: Contact[]) => {
                    this.employees = data.map((c) => ({
                        id: c.id,
                        name: c.name,
                        department_id: c.department?.id || 0,
                        department_name: c.department?.name || ''
                    }));
                },
                error: (err) => console.error(err)
            });
    }

    private updateSelectedEmployeeBalance(employeeId: number): void {
        this.selectedEmployeeBalance = this.leaveBalances.find((b) => b.employee_id === employeeId) || null;
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
        const employee = this.employees.find((e) => e.id === employeeId);
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
            const balance = this.leaveBalances.find((b) => b.employee_id === employeeId);
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
        const personalOverlap = this.vacations.find(
            (v) => v.employee_id === employeeId && v.id !== this.selectedVacation?.id && ['pending', 'approved'].includes(v.status) && this.datesOverlap(startDate, endDate, new Date(v.start_date), new Date(v.end_date))
        );

        if (personalOverlap) {
            errors.push({
                code: 'DATE_OVERLAP',
                message: `У вас уже есть отпуск в этот период (${personalOverlap.start_date} - ${personalOverlap.end_date})`
            });
        }

        // 4. Check department vacation limit
        if (employee) {
            const departmentVacations = this.vacations.filter(
                (v) =>
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
                const overlappingNames = departmentVacations.map((v) => v.employee_name);
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

        const selectedEmployee = this.employees.find((e) => e.id === vacation.employee_id);
        const selectedType = this.vacationTypes.find((t) => t.id === vacation.vacation_type);

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
        if (BALANCE_REQUIRED_TYPES.includes(vacation.vacation_type)) {
            const balance = this.leaveBalances.find((b) => b.employee_id === vacation.employee_id);
            if (balance && vacation.days_count > balance.remaining_days) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка',
                    detail: `Недостаточно дней отпуска. Запрошено: ${vacation.days_count}, доступно: ${balance.remaining_days}`
                });
                return;
            }
        }

        // Update vacation status via API
        this.vacationService
            .updateVacation(vacation.id, { ...vacation } as VacationPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Отправлено',
                        detail: 'Заявка отправлена на согласование руководителю'
                    });
                    this.loadVacations();
                    this.loadVacationBalances();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось отправить заявку' });
                    console.error(err);
                }
            });
    }

    private createVacation() {
        const formValue = this.vacationForm.value;
        const startDate = new Date(formValue.start_date);
        const endDate = new Date(formValue.end_date);

        const payload: VacationPayload = {
            employee_id: formValue.employee_id.id,
            vacation_type: formValue.vacation_type.id,
            start_date: this.dateToYMD(startDate),
            end_date: this.dateToYMD(endDate),
            reason: formValue.reason
        };

        this.vacationService
            .createVacation(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успех',
                        detail: 'Заявка на отпуск создана и отправлена на согласование'
                    });
                    this.loadVacations();
                    this.loadVacationBalances();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать заявку' });
                    console.error(err);
                }
            });
    }

    private updateVacation() {
        if (!this.selectedVacation) return;

        const formValue = this.vacationForm.value;
        const startDate = new Date(formValue.start_date);
        const endDate = new Date(formValue.end_date);

        const payload: VacationPayload = {
            employee_id: formValue.employee_id.id,
            vacation_type: formValue.vacation_type.id,
            start_date: this.dateToYMD(startDate),
            end_date: this.dateToYMD(endDate),
            reason: formValue.reason
        };

        this.vacationService
            .updateVacation(this.selectedVacation.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Заявка обновлена' });
                    this.loadVacations();
                    this.loadVacationBalances();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить заявку' });
                    console.error(err);
                }
            });
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

        this.vacationService
            .approveVacation(vacation.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Одобрено',
                        detail: `Отпуск сотрудника ${vacation.employee_name} одобрен. Даты заблокированы в календаре.`
                    });
                    this.loadVacations();
                    this.loadVacationBalances();
                    this.displayApprovalDialog = false;
                    this.selectedVacation = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось одобрить заявку' });
                    console.error(err);
                }
            });
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

        this.vacationService
            .rejectVacation(vacation.id, rejectionReason)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Отклонено',
                        detail: `Заявка отклонена. Сотрудник ${vacation.employee_name} уведомлен.`
                    });
                    this.loadVacations();
                    this.loadVacationBalances();
                    this.displayRejectionDialog = false;
                    this.selectedVacation = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось отклонить заявку' });
                    console.error(err);
                }
            });
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

        this.vacationService
            .cancelVacation(vacation.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Отменено',
                        detail: 'Заявка на отпуск отменена'
                    });
                    this.loadVacations();
                    this.loadVacationBalances();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось отменить заявку' });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(vacation: Vacation): void {
        this.selectedVacation = vacation;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedVacation) return;

        this.vacationService
            .deleteVacation(this.selectedVacation.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Заявка удалена' });
                    this.loadVacations();
                    this.loadVacationBalances();
                    this.displayDeleteDialog = false;
                    this.selectedVacation = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить заявку' });
                    console.error(err);
                }
            });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warn';
            case 'rejected':
                return 'danger';
            case 'cancelled':
                return 'secondary';
            case 'draft':
                return 'info';
            default:
                return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.vacationStatuses.find((s) => s.id === status);
        return found ? found.name : status;
    }

    getTypeLabel(type: string): string {
        const found = this.vacationTypes.find((t) => t.id === type);
        return found ? found.name : type;
    }

    getEmployeeBalance(employeeId: number): VacationBalance | undefined {
        return this.leaveBalances.find((b) => b.employee_id === employeeId);
    }

    get pendingCount(): number {
        return this.vacations.filter((v) => v.status === 'pending').length;
    }

    get approvedCount(): number {
        return this.vacations.filter((v) => v.status === 'approved').length;
    }

    get rejectedCount(): number {
        return this.vacations.filter((v) => v.status === 'rejected').length;
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
