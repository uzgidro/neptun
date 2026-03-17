import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TableModule, Table } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrganizationType, OrganizationTypePayload } from '@/core/interfaces/organization-type';
import { OrganizationTypeService } from '@/core/services/organization-type.service';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';

@Component({
    selector: 'app-organization-type',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, ReactiveFormsModule, InputTextComponent, DeleteConfirmationComponent, Tooltip, DialogComponent, TranslateModule],
    templateUrl: './organization-type.component.html',
    styleUrl: './organization-type.component.scss'
})
export class OrganizationTypeComponent implements OnInit, OnDestroy {
    // State
    organizationTypes: OrganizationType[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    selectedType: OrganizationType | null = null;
    form!: FormGroup;

    // Services
    private organizationTypeService = inject(OrganizationTypeService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);

    // Destroy
    private destroy$ = new Subject<void>();

    constructor() {
        this.form = this.buildForm();
    }

    ngOnInit(): void {
        this.loadItems();
    }

    private buildForm(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.selectedType = null;
        this.submitted = false;
        this.form.reset();
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.selectedType = null;
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.createItem();
    }

    openDeleteDialog(item: OrganizationType): void {
        this.selectedType = item;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedType) return;

        this.organizationTypeService.delete(this.selectedType.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('HRM.ORGANIZATION_TYPES.SUCCESS_DELETED')
                    });
                    this.loadItems();
                    this.displayDeleteDialog = false;
                    this.selectedType = null;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('HRM.ORGANIZATION_TYPES.ERROR_DELETE')
                    });
                    console.error(err);
                }
            });
    }

    private loadItems(): void {
        this.organizationTypeService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.organizationTypes = data;
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

    private createItem(): void {
        const payload: OrganizationTypePayload = {
            name: this.form.value.name,
            description: this.form.value.description || undefined
        };

        this.organizationTypeService.create(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('HRM.ORGANIZATION_TYPES.SUCCESS_CREATED')
                    });
                    this.loadItems();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('HRM.ORGANIZATION_TYPES.ERROR_CREATE')
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
