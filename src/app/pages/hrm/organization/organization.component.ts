import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Organization, OrganizationPayload } from '@/core/interfaces/organizations';
import { OrganizationService } from '@/core/services/organization.service';
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
import { Ripple } from 'primeng/ripple';

@Component({
    selector: 'app-organization',
    imports: [
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
        DeleteConfirmationComponent,
        Tooltip,
        DialogComponent,
        Ripple
    ],
    templateUrl: './organization.component.html',
    styleUrl: './organization.component.scss'
})
export class OrganizationComponent implements OnInit, OnDestroy {
    organizations: Organization[] = [];
    flatOrganizations: Organization[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedOrganization: Organization | null = null;
    organizationForm: FormGroup;

    isExpanded: boolean = false;
    expandedRows: { [key: string]: boolean } = {};

    private organizationService = inject(OrganizationService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.organizationForm = this.fb.group({
            name: ['', Validators.required],
            parent_organization_id: [null]
        });
    }

    ngOnInit() {
        this.loadOrganizations();
        this.loadFlatOrganizations();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    expandAll() {
        if (Object.keys(this.expandedRows).length === 0) {
            this.expandedRows = this.organizations.reduce(
                (acc, org) => {
                    if (org.id) {
                        acc[org.id] = true;
                    }
                    return acc;
                },
                {} as { [key: string]: boolean }
            );
            this.isExpanded = true;
        } else {
            this.collapseAll();
        }
    }

    collapseAll() {
        this.expandedRows = {};
        this.isExpanded = false;
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedOrganization = null;
        this.submitted = false;
        this.organizationForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(organization: Organization): void {
        this.isEditMode = true;
        this.selectedOrganization = organization;
        this.submitted = false;

        const parentOrg = this.flatOrganizations.find((org) => org.id === organization.parent_organization_id);

        this.organizationForm.patchValue({
            name: organization.name,
            parent_organization_id: parentOrg || null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedOrganization = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.organizationForm.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedOrganization) {
            this.updateOrganization();
        } else {
            this.createOrganization();
        }
    }

    private createOrganization() {
        const formValue = this.organizationForm.value;
        const payload: OrganizationPayload = {
            name: formValue.name,
            parent_organization_id: formValue.parent_organization_id?.id || null
        };

        this.organizationService
            .createOrganization(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Организация успешно создана' });
                    this.loadOrganizations();
                    this.loadFlatOrganizations();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать организацию' });
                    console.error(err);
                }
            });
    }

    private updateOrganization() {
        if (!this.selectedOrganization) return;

        const formValue = this.organizationForm.value;

        if (formValue.parent_organization_id?.id === this.selectedOrganization.id) {
            this.messageService.add({ severity: 'warn', summary: 'Предупреждение', detail: 'Организация не может быть родителем самой себя' });
            return;
        }

        const payload: OrganizationPayload = {
            name: formValue.name,
            parent_organization_id: formValue.parent_organization_id?.id || null
        };

        this.organizationService
            .updateOrganization(this.selectedOrganization.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Организация успешно обновлена' });
                    this.loadOrganizations();
                    this.loadFlatOrganizations();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить организацию' });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(organization: Organization): void {
        this.selectedOrganization = organization;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedOrganization) return;

        this.organizationService
            .deleteOrganization(this.selectedOrganization.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Организация успешно удалена' });
                    this.loadOrganizations();
                    this.loadFlatOrganizations();
                    this.displayDeleteDialog = false;
                    this.selectedOrganization = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить организацию' });
                    console.error(err);
                }
            });
    }

    private loadOrganizations(): void {
        this.organizationService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: (err) => console.log(err),
            complete: () => (this.loading = false)
        });
    }

    private loadFlatOrganizations(): void {
        this.organizationService.getOrganizationsFlat().subscribe({
            next: (data) => {
                this.flatOrganizations = data;
            },
            error: (err) => console.log(err)
        });
    }

    getAvailableParentOrganizations(): Organization[] {
        if (!this.selectedOrganization) {
            return this.flatOrganizations;
        }
        return this.flatOrganizations.filter((org) => org.id !== this.selectedOrganization?.id);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
