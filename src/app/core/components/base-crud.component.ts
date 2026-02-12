import { inject, OnDestroy, Directive } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { BaseEntity, CrudService } from '@/core/interfaces/crud-service.interface';
import { TranslateService } from '@ngx-translate/core';

/**
 * Configuration for CRUD messages.
 * Values should be translation keys (e.g., 'HRM.POSITIONS.SUCCESS_CREATED')
 * that will be resolved using TranslateService.
 */
export interface CrudMessages {
    createSuccess: string;
    createError: string;
    updateSuccess: string;
    updateError: string;
    deleteSuccess: string;
    deleteError: string;
}

/**
 * Base component for CRUD operations.
 * Eliminates code duplication across Employee, Department, Position, etc.
 *
 * Usage:
 * 1. Extend this class in your component
 * 2. Implement abstract methods: buildForm(), buildPayload(), patchFormForEdit()
 * 3. Call super() in constructor with service and messages
 * 4. Call loadItems() in ngOnInit()
 */
@Directive()
export abstract class BaseCrudComponent<T extends BaseEntity, TPayload = Partial<T>> implements OnDestroy {
    // State
    items: T[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedItem: T | null = null;
    form!: FormGroup;

    // Injected services
    protected fb = inject(FormBuilder);
    protected messageService = inject(MessageService);
    protected translate = inject(TranslateService);
    protected destroy$ = new Subject<void>();

    constructor(
        protected service: CrudService<T, TPayload>,
        protected messages: CrudMessages
    ) {
        this.form = this.buildForm();
    }

    /**
     * Build the reactive form for this entity.
     * Override in child class.
     */
    protected abstract buildForm(): FormGroup;

    /**
     * Build payload from form values for create/update.
     * Override in child class.
     */
    protected abstract buildPayload(): TPayload;

    /**
     * Patch form with item data for editing.
     * Override in child class.
     */
    protected abstract patchFormForEdit(item: T): void;

    /**
     * Filter table globally
     */
    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Open dialog for creating new item
     */
    openDialog(): void {
        this.isEditMode = false;
        this.selectedItem = null;
        this.submitted = false;
        this.form.reset();
        this.displayDialog = true;
    }

    /**
     * Open dialog for editing existing item
     */
    openEditDialog(item: T): void {
        this.isEditMode = true;
        this.selectedItem = item;
        this.submitted = false;
        this.form.reset();
        this.patchFormForEdit(item);
        this.displayDialog = true;
    }

    /**
     * Close the dialog
     */
    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedItem = null;
    }

    /**
     * Handle form submission
     */
    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedItem) {
            this.updateItem();
        } else {
            this.createItem();
        }
    }

    /**
     * Open delete confirmation dialog
     */
    openDeleteDialog(item: T): void {
        this.selectedItem = item;
        this.displayDeleteDialog = true;
    }

    /**
     * Confirm and execute deletion
     */
    confirmDelete(): void {
        if (!this.selectedItem) return;

        this.service
            .delete(this.selectedItem.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant(this.messages.deleteSuccess)
                    });
                    this.loadItems();
                    this.displayDeleteDialog = false;
                    this.selectedItem = null;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant(this.messages.deleteError)
                    });
                    console.error(err);
                }
            });
    }

    /**
     * Load all items from service
     */
    loadItems(): void {
        this.service
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.items = data;
                },
                error: () => {},
                complete: () => {
                    this.loading = false;
                }
            });
    }

    /**
     * Create new item
     */
    protected createItem(): void {
        const payload = this.buildPayload();

        this.service
            .create(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant(this.messages.createSuccess)
                    });
                    this.loadItems();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant(this.messages.createError)
                    });
                    console.error(err);
                }
            });
    }

    /**
     * Update existing item
     */
    protected updateItem(): void {
        if (!this.selectedItem) return;

        const payload = this.buildPayload();

        this.service
            .update(this.selectedItem.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant(this.messages.updateSuccess)
                    });
                    this.loadItems();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant(this.messages.updateError)
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
