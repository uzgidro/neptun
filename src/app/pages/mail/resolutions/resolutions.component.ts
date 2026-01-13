import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Resolution, ResolutionPayload, ResolutionType, ResolutionStatus } from '@/core/interfaces/resolution';
import { ResolutionService } from '@/core/services/resolution.service';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-resolutions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        Tag,
        ButtonDirective,
        ButtonIcon,
        ButtonLabel,
        IconField,
        InputIcon,
        InputText,
        Tooltip,
        Select,
        DialogComponent,
        InputTextComponent,
        SelectComponent,
        TextareaComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        TranslateModule
    ],
    templateUrl: './resolutions.component.html',
    styleUrl: './resolutions.component.scss'
})
export class ResolutionsComponent implements OnInit, OnDestroy {
    resolutions: Resolution[] = [];
    filteredResolutions: Resolution[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedResolution: Resolution | null = null;

    currentType: ResolutionType = 'president';
    pageTitle = '';

    resolutionForm: FormGroup;

    selectedStatus: ResolutionStatus | null = null;

    statusOptions: { name: string; value: string | null }[] = [];
    statusFormOptions: { name: string; value: string }[] = [];

    private resolutionService = inject(ResolutionService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    private initOptions(): void {
        this.statusOptions = [
            { name: this.translate.instant('MAIL.COMMON.ALL_STATUSES'), value: null },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.ACTIVE'), value: 'active' },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.DRAFT'), value: 'draft' },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.CANCELLED'), value: 'cancelled' },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.EXPIRED'), value: 'expired' }
        ];

        this.statusFormOptions = [
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.ACTIVE'), value: 'active' },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.DRAFT'), value: 'draft' },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.CANCELLED'), value: 'cancelled' },
            { name: this.translate.instant('MAIL.RESOLUTIONS.STATUS.EXPIRED'), value: 'expired' }
        ];

        this.pageTitle = this.resolutionService.getPageTitle(this.currentType);
    }

    constructor() {
        this.resolutionForm = this.fb.group({
            number: ['', Validators.required],
            date: [null, Validators.required],
            title: ['', Validators.required],
            description: [''],
            status: [null, Validators.required],
            issuedBy: [''],
            effectiveDate: [null],
            expirationDate: [null]
        });
    }

    ngOnInit() {
        this.initOptions();

        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                const type = params['type'] as ResolutionType;
                if (type && ['president', 'cabinet', 'decree', 'order', 'agreement'].includes(type)) {
                    this.currentType = type;
                } else {
                    this.currentType = 'president';
                }
                this.pageTitle = this.resolutionService.getPageTitle(this.currentType);
                this.loadResolutions();
            });

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.initOptions();
        });
    }

    private loadResolutions() {
        this.loading = true;
        this.resolutionService
            .getByType(this.currentType)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.resolutions = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.resolutions];

        if (this.selectedStatus) {
            result = result.filter(r => r.status === this.selectedStatus);
        }

        this.filteredResolutions = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedResolution = null;
        this.submitted = false;
        this.resolutionForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(resolution: Resolution) {
        this.isEditMode = true;
        this.selectedResolution = resolution;
        this.submitted = false;

        const statusOption = this.statusFormOptions.find(s => s.value === resolution.status);

        this.resolutionForm.patchValue({
            number: resolution.number,
            date: resolution.date ? new Date(resolution.date) : null,
            title: resolution.title,
            description: resolution.description || '',
            status: statusOption || null,
            issuedBy: resolution.issuedBy || '',
            effectiveDate: resolution.effectiveDate ? new Date(resolution.effectiveDate) : null,
            expirationDate: resolution.expirationDate ? new Date(resolution.expirationDate) : null
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedResolution = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.resolutionForm.invalid) {
            return;
        }

        const formValue = this.resolutionForm.value;
        const payload: ResolutionPayload = {
            number: formValue.number,
            date: formValue.date instanceof Date
                ? formValue.date.toISOString().split('T')[0]
                : formValue.date,
            title: formValue.title,
            description: formValue.description || undefined,
            type: this.currentType,
            status: formValue.status?.value || formValue.status,
            issuedBy: formValue.issuedBy || undefined,
            effectiveDate: formValue.effectiveDate instanceof Date
                ? formValue.effectiveDate.toISOString().split('T')[0]
                : formValue.effectiveDate || undefined,
            expirationDate: formValue.expirationDate instanceof Date
                ? formValue.expirationDate.toISOString().split('T')[0]
                : formValue.expirationDate || undefined
        };

        if (this.isEditMode && this.selectedResolution) {
            this.resolutionService
                .update(this.selectedResolution.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('MAIL.COMMON.SUCCESS'),
                            detail: this.translate.instant('MAIL.RESOLUTIONS.UPDATED')
                        });
                        this.loadResolutions();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('MAIL.COMMON.ERROR'),
                            detail: this.translate.instant('MAIL.RESOLUTIONS.UPDATE_ERROR')
                        });
                    }
                });
        } else {
            this.resolutionService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('MAIL.COMMON.SUCCESS'),
                            detail: this.translate.instant('MAIL.RESOLUTIONS.CREATED')
                        });
                        this.loadResolutions();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('MAIL.COMMON.ERROR'),
                            detail: this.translate.instant('MAIL.RESOLUTIONS.CREATE_ERROR')
                        });
                    }
                });
        }
    }

    openDeleteDialog(resolution: Resolution) {
        this.selectedResolution = resolution;
        this.displayDeleteDialog = true;
    }

    get deleteConfirmMessage(): string {
        return this.translate.instant('MAIL.COMMON.DELETE_CONFIRM') + ' ' +
               (this.selectedResolution?.number || '') + '?';
    }

    confirmDelete() {
        if (!this.selectedResolution) return;

        this.resolutionService
            .delete(this.selectedResolution.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('MAIL.COMMON.SUCCESS'),
                        detail: this.translate.instant('MAIL.RESOLUTIONS.DELETED')
                    });
                    this.loadResolutions();
                    this.displayDeleteDialog = false;
                    this.selectedResolution = null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('MAIL.COMMON.ERROR'),
                        detail: this.translate.instant('MAIL.RESOLUTIONS.DELETE_ERROR')
                    });
                }
            });
    }

    getStatusLabel(status: ResolutionStatus): string {
        return this.resolutionService.getStatusLabel(status);
    }

    getStatusSeverity(status: ResolutionStatus): any {
        return this.resolutionService.getStatusSeverity(status);
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
