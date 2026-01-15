import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
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
import {
    DeleteConfirmationComponent
} from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Decree, DecreeFilters, DecreePayload } from '@/core/interfaces/chancellery/decree';
import { DocumentType, FileResponse } from '@/core/interfaces/chancellery/document-base';
import { ChangeStatusRequest, DocumentStatus, StatusHistoryEntry, StatusSeverity } from '@/core/interfaces/chancellery/document-status';
import { DecreeService } from '@/core/services/chancellery/decree.service';
import { DocumentStatusService } from '@/core/services/chancellery/document-status.service';

import { StatusHistoryDialogComponent } from '@/pages/chancellery/shared';
import { StatusChangeDialogComponent } from '@/pages/chancellery/shared';

@Component({
    selector: 'app-orders',
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
        FileUploadComponent,
        TranslateModule,
        StatusHistoryDialogComponent,
        StatusChangeDialogComponent
    ],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
    // Data
    documents: Decree[] = [];
    filteredDocuments: Decree[] = [];
    documentTypes: DocumentType[] = [];
    statuses: DocumentStatus[] = [];

    // UI State
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    displayStatusDialog = false;
    displayHistoryDialog = false;
    submitted = false;
    isEditMode = false;
    saving = false;

    // Selected items
    selectedDocument: Decree | null = null;
    selectedFiles: File[] = [];
    existingFileIds: number[] = [];
    statusHistory: StatusHistoryEntry[] = [];
    historyLoading = false;

    // Form
    documentForm: FormGroup;

    // Filters
    filters: DecreeFilters = {};
    selectedTypeId: number | null = null;
    selectedStatusId: number | null = null;

    // Filter options
    typeOptions: { name: string; value: number | null }[] = [];
    statusOptions: { name: string; value: number | null }[] = [];

    // Services
    private decreeService = inject(DecreeService);
    private statusService = inject(DocumentStatusService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.documentForm = this.fb.group({
            name: ['', Validators.required],
            number: [''],
            document_date: [null, Validators.required],
            type_id: [null, Validators.required],
            description: [''],
            status_id: [null],
            due_date: [null]
        });
    }

    ngOnInit(): void {
        this.loadInitialData();

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.buildFilterOptions();
        });
    }

    private loadInitialData(): void {
        this.loading = true;

        forkJoin({
            types: this.decreeService.getTypes(),
            statuses: this.statusService.getStatuses(),
            documents: this.decreeService.getAll()
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ types, statuses, documents }) => {
                    this.documentTypes = types;
                    this.statuses = statuses;
                    this.documents = documents;
                    this.buildFilterOptions();
                    this.applyFilters();
                },
                error: (err) => {
                    console.error('Error loading initial data:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.ERRORS.LOAD_ERROR')
                    });
                },
                complete: () => (this.loading = false)
            });
    }

    private loadDocuments(): void {
        this.loading = true;
        this.decreeService
            .getAll(this.filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.documents = data;
                    this.applyFilters();
                },
                error: (err) => {
                    console.error('Error loading documents:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.ERRORS.LOAD_ERROR')
                    });
                },
                complete: () => (this.loading = false)
            });
    }

    private buildFilterOptions(): void {
        this.typeOptions = [{ name: this.translate.instant('CHANCELLERY.FILTERS.ALL_TYPES'), value: null }, ...this.documentTypes.map((t) => ({ name: t.name, value: t.id }))];

        this.statusOptions = [{ name: this.translate.instant('CHANCELLERY.FILTERS.ALL_STATUSES'), value: null }, ...this.statuses.map((s) => ({ name: s.name, value: s.id }))];
    }

    applyFilters(): void {
        let result = [...this.documents];

        if (this.selectedTypeId) {
            result = result.filter((d) => d.type.id === this.selectedTypeId);
        }

        if (this.selectedStatusId) {
            result = result.filter((d) => d.status.id === this.selectedStatusId);
        }

        this.filteredDocuments = result;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // =========================================================================
    // Dialog Management
    // =========================================================================

    openDialog(): void {
        this.isEditMode = false;
        this.selectedDocument = null;
        this.submitted = false;
        this.selectedFiles = [];
        this.existingFileIds = [];
        this.documentForm.reset();

        // Set default status to draft
        const draftStatus = this.statuses.find((s) => s.code === 'draft');
        if (draftStatus) {
            this.documentForm.patchValue({ status_id: draftStatus.id });
        }

        this.displayDialog = true;
    }

    openEditDialog(document: Decree): void {
        this.isEditMode = true;
        this.selectedDocument = document;
        this.submitted = false;
        this.selectedFiles = [];
        this.existingFileIds = document.files.map((f) => f.id);

        this.documentForm.patchValue({
            name: document.name,
            number: document.number || '',
            document_date: document.document_date ? new Date(document.document_date) : null,
            type_id: document.type.id,
            description: document.description || '',
            status_id: document.status.id,
            due_date: document.due_date ? new Date(document.due_date) : null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedDocument = null;
        this.selectedFiles = [];
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.documentForm.invalid) {
            return;
        }

        this.saving = true;
        const formValue = this.documentForm.value;

        const payload: DecreePayload = {
            name: formValue.name,
            document_date: this.formatDateForApi(formValue.document_date),
            type_id: formValue.type_id,
            number: formValue.number || undefined,
            description: formValue.description || undefined,
            status_id: formValue.status_id || undefined,
            due_date: formValue.due_date ? this.formatDateForApi(formValue.due_date) : undefined
        };

        // Build FormData if we have files
        const hasFiles = this.selectedFiles.length > 0 || this.existingFileIds.length > 0;
        const requestData = hasFiles ? this.decreeService.buildFormData(payload, this.selectedFiles, this.existingFileIds) : payload;

        if (this.isEditMode && this.selectedDocument) {
            this.decreeService
                .update(this.selectedDocument.id, requestData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('COMMON.SUCCESS'),
                            detail: this.translate.instant('CHANCELLERY.DECREES.UPDATED')
                        });
                        this.loadDocuments();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('COMMON.ERROR'),
                            detail: this.translate.instant('CHANCELLERY.DECREES.UPDATE_ERROR')
                        });
                    },
                    complete: () => (this.saving = false)
                });
        } else {
            this.decreeService
                .create(requestData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('COMMON.SUCCESS'),
                            detail: this.translate.instant('CHANCELLERY.DECREES.CREATED')
                        });
                        this.loadDocuments();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('COMMON.ERROR'),
                            detail: this.translate.instant('CHANCELLERY.DECREES.CREATE_ERROR')
                        });
                    },
                    complete: () => (this.saving = false)
                });
        }
    }

    // =========================================================================
    // Delete
    // =========================================================================

    openDeleteDialog(document: Decree): void {
        this.selectedDocument = document;
        this.displayDeleteDialog = true;
    }

    get deleteConfirmMessage(): string {
        const name = this.selectedDocument?.name || '';
        const number = this.selectedDocument?.number ? ` (${this.selectedDocument.number})` : '';
        return `${this.translate.instant('CHANCELLERY.COMMON.DELETE_CONFIRM')} "${name}"${number}?`;
    }

    confirmDelete(): void {
        if (!this.selectedDocument) return;

        this.decreeService
            .delete(this.selectedDocument.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('CHANCELLERY.DECREES.DELETED')
                    });
                    this.loadDocuments();
                    this.displayDeleteDialog = false;
                    this.selectedDocument = null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.DECREES.DELETE_ERROR')
                    });
                }
            });
    }

    // =========================================================================
    // Status Management
    // =========================================================================

    openStatusDialog(document: Decree): void {
        this.selectedDocument = document;
        this.displayStatusDialog = true;
    }

    onStatusChange(request: ChangeStatusRequest): void {
        if (!this.selectedDocument) return;

        this.saving = true;
        this.decreeService
            .changeStatus(this.selectedDocument.id, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('CHANCELLERY.STATUS_CHANGE.SUCCESS')
                    });
                    this.loadDocuments();
                    this.displayStatusDialog = false;
                    this.selectedDocument = null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.STATUS_CHANGE.ERROR')
                    });
                },
                complete: () => (this.saving = false)
            });
    }

    openHistoryDialog(document: Decree): void {
        this.selectedDocument = document;
        this.statusHistory = [];
        this.historyLoading = true;
        this.displayHistoryDialog = true;

        this.decreeService
            .getHistory(document.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (history) => {
                    this.statusHistory = history;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.STATUS_HISTORY.LOAD_ERROR')
                    });
                },
                complete: () => (this.historyLoading = false)
            });
    }

    getCurrentStatus(): DocumentStatus | null {
        if (!this.selectedDocument) return null;
        return this.statuses.find((s) => s.id === this.selectedDocument!.status.id) || null;
    }

    getAvailableStatuses(): DocumentStatus[] {
        const current = this.getCurrentStatus();
        if (!current) return [];
        return this.statusService.getAvailableNextStatuses(current, this.statuses);
    }

    // =========================================================================
    // File Handling
    // =========================================================================

    onFilesSelected(files: File[]): void {
        this.selectedFiles = files;
    }

    onFileRemoved(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    onExistingFileRemoved(fileId: number): void {
        this.existingFileIds = this.existingFileIds.filter((id) => id !== fileId);
    }

    getExistingFiles(): FileResponse[] {
        return this.selectedDocument?.files.filter((f) => this.existingFileIds.includes(f.id)) || [];
    }

    // =========================================================================
    // UI Helpers
    // =========================================================================

    getStatusSeverity(code: string): StatusSeverity {
        return this.statusService.getStatusSeverity(code);
    }

    getTypeLabel(typeId: number): string {
        return this.documentTypes.find((t) => t.id === typeId)?.name || '';
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    private formatDateForApi(date: Date | string): string {
        if (typeof date === 'string') return date;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
