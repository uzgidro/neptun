import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
    PendingDocument,
    RejectSignatureRequest,
    SignableDocumentType,
    Signature,
    SignDocumentRequest
} from '@/core/interfaces/chancellery/signature';
import { Users } from '@/core/interfaces/users';
import { DocumentSignatureService } from '@/core/services/chancellery/document-signature.service';
import { ApiService } from '@/core/services/api.service';

import {
    RejectSignatureDialogComponent,
    SignatureHistoryDialogComponent,
    SignDocumentDialogComponent
} from '@/pages/chancellery/shared';

interface DocumentTypeOption {
    name: string;
    value: SignableDocumentType | null;
}

@Component({
    selector: 'app-pending-signatures',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Tag, ButtonDirective, IconField, InputIcon, InputText, Tooltip, Select, TranslateModule, SignDocumentDialogComponent, RejectSignatureDialogComponent, SignatureHistoryDialogComponent, ButtonIcon],
    templateUrl: './pending-signatures.component.html',
    styleUrl: './pending-signatures.component.scss'
})
export class PendingSignaturesComponent implements OnInit, OnDestroy {
    // Data
    documents: PendingDocument[] = [];
    filteredDocuments: PendingDocument[] = [];
    users: Users[] = [];

    // UI State
    loading = true;
    displaySignDialog = false;
    displayRejectDialog = false;
    displayHistoryDialog = false;
    saving = false;
    historyLoading = false;

    // Selected items
    selectedDocument: PendingDocument | null = null;
    signatures: Signature[] = [];

    // Filters
    selectedDocType: SignableDocumentType | null = null;
    documentTypeOptions: DocumentTypeOption[] = [];

    // Services
    private signatureService = inject(DocumentSignatureService);
    private apiService = inject(ApiService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadInitialData();

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.buildFilterOptions();
        });
    }

    private loadInitialData(): void {
        this.loading = true;

        forkJoin({
            documents: this.signatureService.getPendingDocuments(),
            users: this.apiService.getUsers()
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ documents, users }) => {
                    this.documents = documents;
                    this.users = users;
                    this.buildFilterOptions();
                    this.applyFilters();
                },
                error: (err) => {
                    console.error('Error loading initial data:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.LOAD_ERROR')
                    });
                },
                complete: () => (this.loading = false)
            });
    }

    private loadDocuments(): void {
        this.loading = true;
        this.signatureService
            .getPendingDocuments()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (documents) => {
                    this.documents = documents;
                    this.applyFilters();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.LOAD_ERROR')
                    });
                },
                complete: () => (this.loading = false)
            });
    }

    private buildFilterOptions(): void {
        this.documentTypeOptions = [
            { name: this.translate.instant('CHANCELLERY.FILTERS.ALL_TYPES'), value: null },
            { name: this.translate.instant('CHANCELLERY.TYPES.DECREE'), value: 'decree' },
            { name: this.translate.instant('CHANCELLERY.TYPES.REPORT'), value: 'report' },
            { name: this.translate.instant('CHANCELLERY.TYPES.LETTER'), value: 'letter' },
            { name: this.translate.instant('CHANCELLERY.TYPES.INSTRUCTION'), value: 'instruction' }
        ];
    }

    applyFilters(): void {
        let result = [...this.documents];

        if (this.selectedDocType) {
            result = result.filter((d) => d.document_type === this.selectedDocType);
        }

        this.filteredDocuments = result;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // =========================================================================
    // Sign Dialog
    // =========================================================================

    openSignDialog(document: PendingDocument): void {
        this.selectedDocument = document;
        this.displaySignDialog = true;
    }

    onSignConfirm(request: SignDocumentRequest): void {
        if (!this.selectedDocument) return;

        this.saving = true;
        this.signatureService
            .signDocument(this.selectedDocument.document_type, this.selectedDocument.document_id, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.SIGN_SUCCESS')
                    });
                    this.loadDocuments();
                    this.displaySignDialog = false;
                    this.selectedDocument = null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.SIGN_ERROR')
                    });
                },
                complete: () => (this.saving = false)
            });
    }

    // =========================================================================
    // Reject Dialog
    // =========================================================================

    openRejectDialog(document: PendingDocument): void {
        this.selectedDocument = document;
        this.displayRejectDialog = true;
    }

    onRejectConfirm(request: RejectSignatureRequest): void {
        if (!this.selectedDocument) return;

        this.saving = true;
        this.signatureService
            .rejectSignature(this.selectedDocument.document_type, this.selectedDocument.document_id, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.REJECT_SUCCESS')
                    });
                    this.loadDocuments();
                    this.displayRejectDialog = false;
                    this.selectedDocument = null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.REJECT_ERROR')
                    });
                },
                complete: () => (this.saving = false)
            });
    }

    // =========================================================================
    // History Dialog
    // =========================================================================

    openHistoryDialog(document: PendingDocument): void {
        this.selectedDocument = document;
        this.signatures = [];
        this.historyLoading = true;
        this.displayHistoryDialog = true;

        this.signatureService
            .getSignatures(document.document_type, document.document_id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (signatures) => {
                    this.signatures = signatures;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('CHANCELLERY.SIGNATURE.HISTORY_LOAD_ERROR')
                    });
                },
                complete: () => (this.historyLoading = false)
            });
    }

    // =========================================================================
    // UI Helpers
    // =========================================================================

    getDocumentTypeSeverity(docType: SignableDocumentType): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
        const severities: Record<SignableDocumentType, 'info' | 'success' | 'warn' | 'danger' | 'secondary'> = {
            decree: 'info',
            report: 'success',
            letter: 'warn',
            instruction: 'secondary'
        };
        return severities[docType] ?? 'secondary';
    }

    getDocumentTypeLabel(docType: SignableDocumentType): string {
        const key = this.signatureService.getDocumentTypeKey(docType);
        return this.translate.instant(key);
    }

    getSelectedDocumentName(): string {
        if (!this.selectedDocument) return '';
        const number = this.selectedDocument.number ? ` (${this.selectedDocument.number})` : '';
        return `${this.selectedDocument.name}${number}`;
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
