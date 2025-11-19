import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Department, DepartmentPayload } from '@/core/interfaces/department';
import { DepartmentService } from '@/core/services/department.service';
import { OrganizationService } from '@/core/services/organization.service';
import { Organization } from '@/core/interfaces/organizations';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { Tooltip } from 'primeng/tooltip';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';

@Component({
    selector: 'app-department',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, ReactiveFormsModule, InputTextComponent, SelectComponent, DeleteConfirmationComponent, Tooltip, DialogComponent],
    templateUrl: './department.component.html',
    styleUrl: './department.component.scss'
})
export class DepartmentComponent implements OnInit, OnDestroy {
    departments: Department[] = [];
    organizations: Organization[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedDepartment: Department | null = null;
    departmentForm: FormGroup;

    private departmentService = inject(DepartmentService);
    private organizationService = inject(OrganizationService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.departmentForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            organization_id: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadDepartments();
        this.loadOrganizations();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedDepartment = null;
        this.submitted = false;
        this.departmentForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(department: Department): void {
        this.isEditMode = true;
        this.selectedDepartment = department;
        this.submitted = false;

        // Find the organization object for the select component
        const selectedOrg = this.organizations.find((org) => org.id === department.organization_id);

        this.departmentForm.patchValue({
            name: department.name,
            description: department.description || '',
            organization_id: selectedOrg || null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedDepartment = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.departmentForm.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedDepartment) {
            this.updateDepartment();
        } else {
            this.createDepartment();
        }
    }

    private createDepartment() {
        const formValue = this.departmentForm.value;
        const payload: DepartmentPayload = {
            name: formValue.name,
            description: formValue.description || undefined,
            organization_id: formValue.organization_id.id
        };

        this.departmentService
            .createDepartment(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Отдел успешно создан' });
                    this.loadDepartments();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать отдел' });
                    console.error(err);
                }
            });
    }

    private updateDepartment() {
        if (!this.selectedDepartment) return;

        const formValue = this.departmentForm.value;
        const payload: DepartmentPayload = {
            name: formValue.name,
            description: formValue.description || undefined,
            organization_id: formValue.organization_id.id
        };

        this.departmentService
            .updateDepartment(this.selectedDepartment.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Отдел успешно обновлен' });
                    this.loadDepartments();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить отдел' });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(department: Department): void {
        this.selectedDepartment = department;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedDepartment) return;

        this.departmentService
            .deleteDepartment(this.selectedDepartment.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Отдел успешно удален' });
                    this.loadDepartments();
                    this.displayDeleteDialog = false;
                    this.selectedDepartment = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить отдел' });
                    console.error(err);
                }
            });
    }

    private loadDepartments(): void {
        this.departmentService.getDepartments().subscribe({
            next: (data) => {
                this.departments = data;
            },
            error: (err) => console.log(err),
            complete: () => (this.loading = false)
        });
    }

    private loadOrganizations(): void {
        this.organizationService.getOrganizationsFlat().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: (err) => console.log(err)
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
