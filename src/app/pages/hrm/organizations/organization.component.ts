import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TreeNode, MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { MultiSelect } from 'primeng/multiselect';
import { Tooltip } from 'primeng/tooltip';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Organization, OrganizationPayload } from '@/core/interfaces/organizations';
import { OrganizationType } from '@/core/interfaces/organization-type';
import { OrganizationService } from '@/core/services/organization.service';
import { OrganizationTypeService } from '@/core/services/organization-type.service';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';


@Component({
    selector: 'app-organization',
    imports: [
        TreeTableModule,
        ButtonDirective,
        ButtonIcon,
        ButtonLabel,
        Chip,
        MultiSelect,
        Tooltip,
        IconField,
        InputIcon,
        InputText,
        ReactiveFormsModule,
        TranslateModule,
        DialogComponent,
        InputTextComponent,
        SelectComponent,
    ],
    templateUrl: './organization.component.html',
    styleUrl: './organization.component.scss'
})
export class OrganizationComponent implements OnInit, OnDestroy {
    treeNodes: TreeNode[] = [];
    flatOrganizations: Organization[] = [];
    organizationTypes: OrganizationType[] = [];
    loading = true;
    displayDialog = false;

    submitted = false;
    isEditMode = false;
    selectedOrganization: Organization | null = null;
    form!: FormGroup;
    globalFilterValue = '';

    @ViewChild('tt') treeTable!: TreeTable;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    private organizationService = inject(OrganizationService);
    private organizationTypeService = inject(OrganizationTypeService);

    constructor() {
        this.form = this.buildForm();
    }

    ngOnInit(): void {
        this.loadTreeData();
        this.loadFlatOrganizations();
        this.loadOrganizationTypes();
    }

    private buildForm(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            parent_organization_id: [null],
            type_ids: [[]]
        });
    }

    private loadTreeData(): void {
        this.loading = true;
        this.organizationService.getOrganizationsTree()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.treeNodes = this.mapToTreeNodes(data);
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.LOAD_ERROR')
                    });
                    console.error(err);
                    this.loading = false;
                },
                complete: () => {
                    this.loading = false;
                }
            });
    }

    private loadFlatOrganizations(): void {
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.flatOrganizations = data;
                }
            });
    }

    private loadOrganizationTypes(): void {
        this.organizationTypeService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.organizationTypes = data;
                }
            });
    }

    private mapToTreeNodes(orgs: Organization[]): TreeNode[] {
        return orgs.map(org => ({
            data: org,
            children: org.items ? this.mapToTreeNodes(org.items) : [],
            expanded: true
        }));
    }

    get parentOrganizationOptions(): Organization[] {
        if (!this.isEditMode || !this.selectedOrganization) {
            return this.flatOrganizations;
        }
        return this.flatOrganizations.filter(org => org.id !== this.selectedOrganization!.id);
    }

    expandAll(): void {
        this.treeNodes = this.setExpandedState(this.treeNodes, true);
    }

    collapseAll(): void {
        this.treeNodes = this.setExpandedState(this.treeNodes, false);
    }

    private setExpandedState(nodes: TreeNode[], expanded: boolean): TreeNode[] {
        return nodes.map(node => ({
            ...node,
            expanded,
            children: node.children ? this.setExpandedState(node.children, expanded) : []
        }));
    }

    onGlobalFilter(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.globalFilterValue = value;
        this.treeTable.filterGlobal(value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedOrganization = null;
        this.submitted = false;
        this.form.reset({ name: '', parent_organization_id: null, type_ids: [] });
        this.displayDialog = true;
    }

    openEditDialog(org: Organization): void {
        this.isEditMode = true;
        this.selectedOrganization = org;
        this.submitted = false;
        this.form.reset();

        const selectedParent = this.flatOrganizations.find(o => o.id === org.parent_organization_id) || null;
        const selectedTypes = this.organizationTypes.filter(t => org.types?.includes(t.name));

        this.form.patchValue({
            name: org.name,
            parent_organization_id: selectedParent,
            type_ids: selectedTypes
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedOrganization = null;
    }

    openDeleteDialog(org: Organization): void {
        const message = this.translate.instant('HRM.ORGANIZATIONS.DELETE_CONFIRM') + ' ' + (org.name || '') + '?';
        if (!window.confirm(message)) return;

        this.selectedOrganization = org;
        this.organizationService.deleteOrganization(org.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('HRM.ORGANIZATIONS.SUCCESS_DELETED')
                    });
                    this.loadTreeData();
                    this.loadFlatOrganizations();
                    this.selectedOrganization = null;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('HRM.ORGANIZATIONS.ERROR_DELETE')
                    });
                    console.error(err);
                }
            });
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedOrganization) {
            this.updateOrganization();
        } else {
            this.createOrganization();
        }
    }

    private buildPayload(): OrganizationPayload {
        const formValue = this.form.value;
        const selectedTypes: OrganizationType[] = formValue.type_ids || [];

        return {
            name: formValue.name,
            parent_organization_id: formValue.parent_organization_id?.id || null,
            type_ids: selectedTypes.map(t => Number(t.id))
        };
    }

    private createOrganization(): void {
        const payload = this.buildPayload();

        this.organizationService.createOrganization(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('HRM.ORGANIZATIONS.SUCCESS_CREATED')
                    });
                    this.loadTreeData();
                    this.loadFlatOrganizations();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('HRM.ORGANIZATIONS.ERROR_CREATE')
                    });
                    console.error(err);
                }
            });
    }

    private updateOrganization(): void {
        if (!this.selectedOrganization) return;

        const payload = this.buildPayload();

        this.organizationService.updateOrganization(this.selectedOrganization.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('HRM.ORGANIZATIONS.SUCCESS_UPDATED')
                    });
                    this.loadTreeData();
                    this.loadFlatOrganizations();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('HRM.ORGANIZATIONS.ERROR_UPDATE')
                    });
                    console.error(err);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
