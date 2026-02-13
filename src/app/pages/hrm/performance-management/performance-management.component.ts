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
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GOAL_STATUSES, GoalPayload, PerformanceGoal, REVIEW_TYPES } from '@/core/interfaces/hrm/performance';
import { PerformanceService } from '@/core/services/hrm/performance.service';
import { ContactService } from '@/core/services/contact.service';
import { Contact } from '@/core/interfaces/contact';

@Component({
    selector: 'app-performance-management',
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
        InputTextComponent,
        SelectComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        Tooltip,
        Tag,
        ProgressBarModule,
        DialogComponent,
        TranslateModule
    ],
    templateUrl: './performance-management.component.html',
    styleUrl: './performance-management.component.scss'
})
export class PerformanceManagementComponent implements OnInit, OnDestroy {
    goals: PerformanceGoal[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedGoal: PerformanceGoal | null = null;
    goalForm: FormGroup;

    // Data from services
    employees: { id: number; name: string }[] = [];

    goalStatuses = GOAL_STATUSES.map((s) => ({ id: s.value, name: s.label }));
    reviewTypes = REVIEW_TYPES.map((t) => ({ id: t.value, name: t.label }));

    private performanceService = inject(PerformanceService);
    private contactService = inject(ContactService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.goalForm = this.fb.group({
            employee_id: [null, Validators.required],
            title: ['', Validators.required],
            target_value: [null],
            weight: [1.0, [Validators.required, Validators.min(0), Validators.max(1)]],
            due_date: [null]
        });
    }

    ngOnInit() {
        this.loadGoals();
        this.loadEmployees();
    }

    private loadGoals(): void {
        this.performanceService
            .getGoals()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.goals = data;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERFORMANCE.LOAD_ERROR') });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    private loadEmployees(): void {
        this.contactService
            .getContacts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: Contact[]) => {
                    this.employees = data.map((c) => ({ id: c.id, name: c.name }));
                },
                error: (err) => console.error(err)
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedGoal = null;
        this.submitted = false;
        this.goalForm.reset();
        this.goalForm.patchValue({ weight: 100 });
        this.displayDialog = true;
    }

    openEditDialog(goal: PerformanceGoal): void {
        this.isEditMode = true;
        this.selectedGoal = goal;
        this.submitted = false;
        this.goalForm.reset();

        const selectedEmployee = this.employees.find((e) => e.id === goal.employee_id);

        this.goalForm.patchValue({
            employee_id: selectedEmployee || null,
            title: goal.title,
            target_value: goal.target_value,
            weight: goal.weight,
            due_date: goal.due_date ? new Date(goal.due_date) : null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedGoal = null;
    }

    onSubmit() {
        this.submitted = true;
        if (this.goalForm.invalid) return;

        if (this.isEditMode && this.selectedGoal) {
            this.updateGoal();
        } else {
            this.createGoal();
        }
    }

    private createGoal(): void {
        const formValue = this.goalForm.value;
        const payload: GoalPayload = {
            employee_id: formValue.employee_id?.id,
            title: formValue.title,
            target_value: formValue.target_value,
            weight: formValue.weight,
            due_date: formValue.due_date ? this.dateToYMD(formValue.due_date) : undefined
        };

        this.performanceService
            .createGoal(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.PERFORMANCE.CREATE_SUCCESS') });
                    this.loadGoals();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERFORMANCE.CREATE_ERROR') });
                    console.error(err);
                }
            });
    }

    private updateGoal(): void {
        if (!this.selectedGoal) return;

        const formValue = this.goalForm.value;
        const payload: GoalPayload = {
            employee_id: formValue.employee_id?.id,
            title: formValue.title,
            target_value: formValue.target_value,
            weight: formValue.weight,
            due_date: formValue.due_date ? this.dateToYMD(formValue.due_date) : undefined
        };

        this.performanceService
            .updateGoal(this.selectedGoal.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.PERFORMANCE.UPDATE_SUCCESS') });
                    this.loadGoals();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERFORMANCE.UPDATE_ERROR') });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(goal: PerformanceGoal): void {
        this.selectedGoal = goal;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedGoal) return;

        this.performanceService
            .deleteGoal(this.selectedGoal.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.PERFORMANCE.DELETE_SUCCESS') });
                    this.loadGoals();
                    this.displayDeleteDialog = false;
                    this.selectedGoal = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERFORMANCE.DELETE_ERROR') });
                    console.error(err);
                }
            });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'completed':
                return 'success';
            case 'exceeded':
                return 'info';
            case 'in_progress':
                return 'warn';
            case 'not_achieved':
                return 'danger';
            case 'not_started':
                return 'secondary';
            default:
                return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.goalStatuses.find((s) => s.id === status);
        return found ? found.name : status;
    }

    getProgressColor(progress: number): string {
        if (progress >= 100) return 'green';
        if (progress >= 70) return 'blue';
        if (progress >= 40) return 'orange';
        return 'red';
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
