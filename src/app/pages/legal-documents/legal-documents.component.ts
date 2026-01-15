import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';

import { LegalDocument, LegalDocumentFilters, LegalDocumentPayload, LegalDocumentType } from '@/core/interfaces/chancellery';
import { FileResponse } from '@/core/interfaces/chancellery/document-base';
import { LegalDocumentService } from '@/core/services/legal-document.service';

@Component({
    selector: 'app-legal-documents',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        Tooltip,
        DatePicker,
        Tag,
        Dialog,
        DialogComponent,
        InputTextComponent,
        DatePickerComponent,
        SelectComponent,
        DeleteConfirmationComponent,
        FileUploadComponent,
        TranslateModule
    ],
    templateUrl: './legal-documents.component.html',
    styleUrl: './legal-documents.component.scss'
})
export class LegalDocumentsComponent implements OnInit, OnDestroy {
    // Data
    documents: LegalDocument[] = [];
    documentTypes: LegalDocumentType[] = [];

    // UI State
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    displayFilesDialog = false;
    submitted = false;
    isEditMode = false;
    saving = false;

    // Selected items
    selectedDocument: LegalDocument | null = null;
    selectedFiles: File[] = [];
    existingFileIds: number[] = [];
    selectedDocumentForFiles: LegalDocument | null = null;

    // Form
    documentForm: FormGroup;

    // Filters from route
    typeId: number | null = null;
    pageTitle = '';

    // Date range filter
    dateRange: Date[] | null = null;

    // Delete confirmation
    deleteConfirmMessage = '';

    // Services
    private legalDocumentService = inject(LegalDocumentService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private route = inject(ActivatedRoute);
    private destroy$ = new Subject<void>();

    constructor() {
        this.documentForm = this.fb.group({
            name: ['', Validators.required],
            number: [''],
            document_date: [null, Validators.required],
            type_id: [null]
        });
    }

    ngOnInit(): void {
        // Subscribe to query params to filter by type_id
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            const typeId = params['type_id'];
            this.typeId = typeId ? Number(typeId) : null;
            this.loadInitialData();
        });

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updatePageTitle();
        });
    }

    private loadInitialData(): void {
        this.loading = true;

        // Load types first to get title
        this.legalDocumentService
            .getTypes()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (types) => {
                    this.documentTypes = types;
                    this.updatePageTitle();
                    this.loadDocuments();
                },
                error: (err) => {
                    console.error('Error loading types:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('LEGAL_DOCUMENTS.ERRORS.LOAD_TYPES_ERROR')
                    });
                    this.loading = false;
                }
            });
    }

    private updatePageTitle(): void {
        if (this.typeId && this.documentTypes.length > 0) {
            const type = this.documentTypes.find((t) => t.id === this.typeId);
            this.pageTitle = type?.name || this.translate.instant('LEGAL_DOCUMENTS.TITLE');
        } else {
            this.pageTitle = this.translate.instant('LEGAL_DOCUMENTS.ALL_DOCUMENTS');
        }
    }

    private loadDocuments(): void {
        const filters: LegalDocumentFilters = {};

        if (this.typeId) {
            filters.type_id = this.typeId;
        }

        if (this.dateRange && this.dateRange.length === 2) {
            if (this.dateRange[0]) {
                filters.start_date = this.formatDateForApi(this.dateRange[0]);
            }
            if (this.dateRange[1]) {
                filters.end_date = this.formatDateForApi(this.dateRange[1]);
            }
        }

        this.legalDocumentService
            .getAll(filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.documents = data;
                },
                error: (err) => {
                    console.error('Error loading documents:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('LEGAL_DOCUMENTS.ERRORS.LOAD_ERROR')
                    });
                },
                complete: () => (this.loading = false)
            });
    }

    applyDateFilter(): void {
        this.loadDocuments();
    }

    clearFilters(): void {
        this.dateRange = null;
        this.loadDocuments();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // Dialog management
    openDialog(): void {
        this.isEditMode = false;
        this.selectedDocument = null;
        this.selectedFiles = [];
        this.existingFileIds = [];
        this.submitted = false;

        this.documentForm.reset();

        // Pre-select type if filtering by type
        if (this.typeId) {
            this.documentForm.patchValue({ type_id: this.typeId });
        }

        this.displayDialog = true;
    }

    openEditDialog(doc: LegalDocument): void {
        this.isEditMode = true;
        this.selectedDocument = doc;
        this.selectedFiles = [];
        this.existingFileIds = doc.files?.map((f) => f.id) || [];
        this.submitted = false;

        this.documentForm.patchValue({
            name: doc.name,
            number: doc.number || '',
            document_date: doc.document_date ? new Date(doc.document_date) : null,
            type_id: doc.type.id
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.submitted = false;
        this.selectedDocument = null;
        this.selectedFiles = [];
        this.existingFileIds = [];
        this.documentForm.reset();
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.documentForm.invalid) {
            return;
        }

        this.saving = true;
        const rawValue = this.documentForm.getRawValue();

        const payload: LegalDocumentPayload = {
            name: rawValue.name,
            number: rawValue.number || undefined,
            document_date: this.formatDateForApi(rawValue.document_date),
            type_id: rawValue.type_id || this.typeId || 1
        };

        const hasFiles = this.selectedFiles.length > 0 || this.existingFileIds.length > 0;
        const requestData = hasFiles ? this.legalDocumentService.buildFormData(payload, this.selectedFiles, this.existingFileIds) : payload;

        if (this.isEditMode && this.selectedDocument) {
            this.legalDocumentService
                .update(this.selectedDocument.id, requestData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('COMMON.SUCCESS'),
                            detail: this.translate.instant('LEGAL_DOCUMENTS.UPDATED')
                        });
                        this.closeDialog();
                        this.loadDocuments();
                    },
                    error: (err) => {
                        console.error('Error updating document:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('COMMON.ERROR'),
                            detail: this.translate.instant('LEGAL_DOCUMENTS.UPDATE_ERROR')
                        });
                    },
                    complete: () => (this.saving = false)
                });
        } else {
            this.legalDocumentService
                .create(requestData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('COMMON.SUCCESS'),
                            detail: this.translate.instant('LEGAL_DOCUMENTS.CREATED')
                        });
                        this.closeDialog();
                        this.loadDocuments();
                    },
                    error: (err) => {
                        console.error('Error creating document:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('COMMON.ERROR'),
                            detail: this.translate.instant('LEGAL_DOCUMENTS.CREATE_ERROR')
                        });
                    },
                    complete: () => (this.saving = false)
                });
        }
    }

    // Delete
    openDeleteDialog(doc: LegalDocument): void {
        this.selectedDocument = doc;
        this.deleteConfirmMessage = `${this.translate.instant('LEGAL_DOCUMENTS.DELETE_CONFIRM')} "${doc.name}"?`;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedDocument) return;

        this.legalDocumentService
            .delete(this.selectedDocument.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('LEGAL_DOCUMENTS.DELETED')
                    });
                    this.displayDeleteDialog = false;
                    this.selectedDocument = null;
                    this.loadDocuments();
                },
                error: (err) => {
                    console.error('Error deleting document:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('LEGAL_DOCUMENTS.DELETE_ERROR')
                    });
                }
            });
    }

    // Files
    showFiles(doc: LegalDocument): void {
        this.selectedDocumentForFiles = doc;
        this.displayFilesDialog = true;
    }

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
        if (!this.selectedDocument?.files) return [];
        return this.selectedDocument.files.filter((f) => this.existingFileIds.includes(f.id));
    }

    // Helpers
    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateForApi(date: Date | null): string {
        if (!date) return '';
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
