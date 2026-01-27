import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { HRDocumentsService } from '@/core/services/hr-documents.service';
import { DepartmentService } from '@/core/services/department.service';
import { ContactService } from '@/core/services/contact.service';
import {
    HRDocument,
    DocumentRequest,
    DocumentStats,
    DocumentType,
    DocumentCategory,
    DocumentStatus,
    RequestStatus,
    DOCUMENT_TYPES,
    DOCUMENT_CATEGORIES,
    DOCUMENT_STATUSES,
    REQUEST_STATUSES
} from '@/core/interfaces/hrm/hr-documents';

interface Department {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    name: string;
    department: string;
}

@Component({
    selector: 'app-hr-documents',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonDirective,
        Select,
        TableModule,
        Tag,
        Tooltip,
        Dialog,
        InputText,
        Textarea,
        TabsModule,
        ConfirmDialog,
        InputGroup,
        InputGroupAddon
    ],
    providers: [ConfirmationService],
    templateUrl: './hr-documents.component.html',
    styleUrl: './hr-documents.component.scss'
})
export class HRDocumentsComponent implements OnInit, OnDestroy {
    // Data
    documents: HRDocument[] = [];
    requests: DocumentRequest[] = [];
    departments: Department[] = [];
    employees: Employee[] = [];

    // Stats
    stats: DocumentStats = {
        total_documents: 0,
        pending_signatures: 0,
        my_pending_signatures: 0,
        expiring_soon: 0,
        requests_pending: 0,
        documents_by_type: [],
        documents_by_status: []
    };

    // Options
    documentTypes = DOCUMENT_TYPES;
    documentCategories = DOCUMENT_CATEGORIES;
    documentStatuses = DOCUMENT_STATUSES;
    requestStatuses = REQUEST_STATUSES;

    // Filters
    searchQuery: string = '';
    selectedType: DocumentType | null = null;
    selectedCategory: DocumentCategory | null = null;
    selectedStatus: DocumentStatus | null = null;
    selectedDepartment: number | null = null;

    // State
    loading: boolean = false;
    activeTabIndex: number = 0;

    // Document Dialog
    displayDocumentDialog: boolean = false;
    isEditMode: boolean = false;
    selectedDocument: HRDocument | null = null;
    documentForm: Partial<HRDocument> = {};

    // Request Dialog
    displayRequestDialog: boolean = false;
    selectedRequest: DocumentRequest | null = null;
    requestForm: Partial<DocumentRequest> = {};

    // View Dialog
    displayViewDialog: boolean = false;
    viewDocument: HRDocument | null = null;

    // Sign Dialog
    displaySignDialog: boolean = false;
    signComment: string = '';

    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private hrDocumentsService = inject(HRDocumentsService);
    private departmentService = inject(DepartmentService);
    private contactService = inject(ContactService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadAllData();
    }

    private loadAllData(): void {
        this.loading = true;

        forkJoin({
            documents: this.hrDocumentsService.getDocuments(),
            requests: this.hrDocumentsService.getRequests(),
            departments: this.departmentService.getDepartments(),
            employees: this.contactService.getContacts()
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.documents = data.documents;
                this.requests = data.requests;
                this.departments = data.departments.map(d => ({ id: d.id, name: d.name }));
                this.employees = data.employees.map(e => ({ id: e.id, name: e.name, department: e.department?.name || '' }));
                this.calculateStats();
                this.loading = false;
            },
            error: (err) => {
                console.error('Ошибка загрузки данных:', err);
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные' });
                this.loading = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private calculateStats(): void {
        this.stats = {
            total_documents: this.documents.length,
            pending_signatures: this.documents.filter(d => d.status === 'pending_signature').length,
            my_pending_signatures: 0,
            expiring_soon: this.documents.filter(d => d.valid_until && this.isExpiringSoon(d.valid_until)).length,
            requests_pending: this.requests.filter(r => r.status === 'pending').length,
            documents_by_type: this.getDocumentsByType(),
            documents_by_status: this.getDocumentsByStatus()
        };
    }

    private isExpiringSoon(dateStr: string): boolean {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 0 && diffDays <= 30;
    }

    private getDocumentsByType(): { type: DocumentType; count: number }[] {
        const counts = new Map<DocumentType, number>();
        this.documents.forEach(d => {
            counts.set(d.type, (counts.get(d.type) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
    }

    private getDocumentsByStatus(): { status: DocumentStatus; count: number }[] {
        const counts = new Map<DocumentStatus, number>();
        this.documents.forEach(d => {
            counts.set(d.status, (counts.get(d.status) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
    }

    // Filtering
    get filteredDocuments(): HRDocument[] {
        return this.documents.filter(doc => {
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const matchesSearch = doc.title.toLowerCase().includes(query) ||
                    doc.document_number.toLowerCase().includes(query) ||
                    doc.employee_name?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }
            if (this.selectedType && doc.type !== this.selectedType) return false;
            if (this.selectedCategory && doc.category !== this.selectedCategory) return false;
            if (this.selectedStatus && doc.status !== this.selectedStatus) return false;
            if (this.selectedDepartment && doc.department_id !== this.selectedDepartment) return false;
            return true;
        });
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedType = null;
        this.selectedCategory = null;
        this.selectedStatus = null;
        this.selectedDepartment = null;
    }

    // Document CRUD
    openNewDocumentDialog(): void {
        this.isEditMode = false;
        this.documentForm = {
            type: 'order',
            category: 'personnel',
            status: 'draft',
            requires_signature: false,
            version: 1,
            is_template: false
        };
        this.displayDocumentDialog = true;
    }

    openEditDocumentDialog(doc: HRDocument): void {
        this.isEditMode = true;
        this.selectedDocument = doc;
        this.documentForm = { ...doc };
        this.displayDocumentDialog = true;
    }

    saveDocument(): void {
        if (!this.documentForm.title || !this.documentForm.type) {
            this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Заполните обязательные поля'
            });
            return;
        }

        if (this.isEditMode && this.selectedDocument) {
            // Update existing
            const index = this.documents.findIndex(d => d.id === this.selectedDocument!.id);
            if (index !== -1) {
                this.documents[index] = { ...this.documents[index], ...this.documentForm } as HRDocument;
            }
            this.messageService.add({
                severity: 'success',
                summary: 'Сохранено',
                detail: 'Документ обновлён'
            });
        } else {
            // Create new
            const newDoc: HRDocument = {
                id: Math.max(...this.documents.map(d => d.id)) + 1,
                document_number: this.generateDocNumber(this.documentForm.type as DocumentType),
                title: this.documentForm.title!,
                type: this.documentForm.type as DocumentType,
                category: this.documentForm.category as DocumentCategory,
                status: 'draft',
                created_by: 1,
                created_by_name: 'Текущий пользователь',
                created_at: new Date().toISOString(),
                requires_signature: this.documentForm.requires_signature || false,
                version: 1,
                is_template: false,
                ...this.documentForm
            } as HRDocument;
            this.documents.unshift(newDoc);
            this.messageService.add({
                severity: 'success',
                summary: 'Создано',
                detail: 'Документ создан'
            });
        }

        this.displayDocumentDialog = false;
        this.calculateStats();
    }

    private generateDocNumber(type: DocumentType): string {
        const prefixes: Record<DocumentType, string> = {
            employment_contract: 'ТД',
            contract_amendment: 'ДС',
            order: 'ПР',
            statement: 'ЗВ',
            certificate: 'СПР',
            memo: 'СЗ',
            act: 'АКТ',
            protocol: 'ПРТ',
            regulation: 'ПЛ',
            instruction: 'ИНС',
            report: 'ОТЧ',
            other: 'ДОК'
        };
        const year = new Date().getFullYear();
        const num = String(this.documents.filter(d => d.type === type).length + 1).padStart(3, '0');
        return `${prefixes[type]}-${year}-${num}`;
    }

    deleteDocument(doc: HRDocument): void {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить документ "${doc.title}"?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Удалить',
            rejectLabel: 'Отмена',
            accept: () => {
                this.documents = this.documents.filter(d => d.id !== doc.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Удалено',
                    detail: 'Документ удалён'
                });
                this.calculateStats();
            }
        });
    }

    // View document
    viewDocumentDetails(doc: HRDocument): void {
        this.viewDocument = doc;
        this.displayViewDialog = true;
    }

    // Signatures
    openSignDialog(doc: HRDocument): void {
        this.selectedDocument = doc;
        this.signComment = '';
        this.displaySignDialog = true;
    }

    signDocument(approve: boolean): void {
        if (!this.selectedDocument) return;

        // Find pending signature for current user
        const signature = this.selectedDocument.signatures?.find(s => s.status === 'pending' && s.order === 1);
        if (signature) {
            signature.status = approve ? 'signed' : 'rejected';
            signature.signed_at = new Date().toISOString();
            signature.comment = this.signComment || undefined;

            // Check if all signatures are completed
            const allSigned = this.selectedDocument.signatures?.every(s => s.status === 'signed');
            const anyRejected = this.selectedDocument.signatures?.some(s => s.status === 'rejected');

            if (anyRejected) {
                this.selectedDocument.status = 'rejected';
            } else if (allSigned) {
                this.selectedDocument.status = 'signed';
            }
        }

        this.messageService.add({
            severity: approve ? 'success' : 'warn',
            summary: approve ? 'Подписано' : 'Отклонено',
            detail: approve ? 'Документ подписан' : 'Документ отклонён'
        });

        this.displaySignDialog = false;
        this.calculateStats();
    }

    // Send for signature
    sendForSignature(doc: HRDocument): void {
        doc.status = 'pending_signature';
        this.messageService.add({
            severity: 'success',
            summary: 'Отправлено',
            detail: 'Документ отправлен на подписание'
        });
        this.calculateStats();
    }

    // Requests
    openNewRequestDialog(): void {
        this.requestForm = {
            document_type: 'certificate',
            copies_count: 1
        };
        this.displayRequestDialog = true;
    }

    processRequest(request: DocumentRequest, approve: boolean): void {
        if (approve) {
            request.status = 'in_progress';
            this.messageService.add({
                severity: 'info',
                summary: 'В работе',
                detail: 'Заявка принята в работу'
            });
        } else {
            request.status = 'rejected';
            this.messageService.add({
                severity: 'warn',
                summary: 'Отклонено',
                detail: 'Заявка отклонена'
            });
        }
        this.calculateStats();
    }

    completeRequest(request: DocumentRequest): void {
        request.status = 'completed';
        request.processed_at = new Date().toISOString();
        request.processed_by_name = 'Текущий пользователь';
        this.messageService.add({
            severity: 'success',
            summary: 'Выполнено',
            detail: 'Заявка выполнена'
        });
        this.calculateStats();
    }

    // Helpers
    getTypeLabel(type: DocumentType): string {
        return this.documentTypes.find(t => t.value === type)?.label || type;
    }

    getTypeIcon(type: DocumentType): string {
        return this.documentTypes.find(t => t.value === type)?.icon || 'pi-file';
    }

    getCategoryLabel(category: DocumentCategory): string {
        return this.documentCategories.find(c => c.value === category)?.label || category;
    }

    getStatusLabel(status: DocumentStatus): string {
        return this.documentStatuses.find(s => s.value === status)?.label || status;
    }

    getStatusSeverity(status: DocumentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.documentStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getRequestStatusLabel(status: RequestStatus): string {
        return this.requestStatuses.find(s => s.value === status)?.label || status;
    }

    getRequestStatusSeverity(status: RequestStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.requestStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString('ru-RU');
    }

    canSign(doc: HRDocument): boolean {
        if (doc.status !== 'pending_signature') return false;
        // Check if current user has pending signature
        return doc.signatures?.some(s => s.status === 'pending' && s.order === 1) || false;
    }

    canEdit(doc: HRDocument): boolean {
        return doc.status === 'draft';
    }

    canSendForSignature(doc: HRDocument): boolean {
        return doc.status === 'draft' && doc.requires_signature;
    }

    onTabChange(event: any): void {
        this.activeTabIndex = event.index;
    }
}
