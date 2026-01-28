import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Department, DepartmentPayload } from '@/core/interfaces/department';
import { DepartmentService } from '@/core/services/department.service';
import { OrganizationService } from '@/core/services/organization.service';
import { Organization } from '@/core/interfaces/organizations';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { Tooltip } from 'primeng/tooltip';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { BaseCrudComponent } from '@/core/components/base-crud.component';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'app-department',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, ReactiveFormsModule, InputTextComponent, SelectComponent, DeleteConfirmationComponent, Tooltip, DialogComponent],
    templateUrl: './department.component.html',
    styleUrl: './department.component.scss'
})
export class DepartmentComponent extends BaseCrudComponent<Department, DepartmentPayload> implements OnInit {
    organizations: Organization[] = [];

    private organizationService = inject(OrganizationService);

    constructor() {
        super(inject(DepartmentService), {
            createSuccess: 'Отдел успешно создан',
            createError: 'Не удалось создать отдел',
            updateSuccess: 'Отдел успешно обновлен',
            updateError: 'Не удалось обновить отдел',
            deleteSuccess: 'Отдел успешно удален',
            deleteError: 'Не удалось удалить отдел'
        });
    }

    ngOnInit(): void {
        this.loadItems();
        this.loadOrganizations();
    }

    protected buildForm(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            description: [''],
            organization_id: [null, Validators.required]
        });
    }

    protected buildPayload(): DepartmentPayload {
        const formValue = this.form.value;
        return {
            name: formValue.name,
            description: formValue.description || undefined,
            organization_id: formValue.organization_id.id
        };
    }

    protected patchFormForEdit(department: Department): void {
        const selectedOrg = this.organizations.find((org) => org.id === department.organization_id);

        this.form.patchValue({
            name: department.name,
            description: department.description || '',
            organization_id: selectedOrg || null
        });
    }

    private loadOrganizations(): void {
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.organizations = data;
                }
            });
    }

    // Aliases for template compatibility
    get departments(): Department[] {
        return this.items;
    }

    get departmentForm(): FormGroup {
        return this.form;
    }

    get selectedDepartment(): Department | null {
        return this.selectedItem;
    }
}
