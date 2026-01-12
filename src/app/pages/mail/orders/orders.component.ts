import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Order, OrderPayload, OrderStatus } from '@/core/interfaces/order';
import { OrderService } from '@/core/services/order.service';
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
        TranslateModule
    ],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedOrder: Order | null = null;

    orderForm: FormGroup;

    selectedStatus: OrderStatus | null = null;

    statusOptions: { name: string; value: string | null }[] = [];
    statusFormOptions: { name: string; value: string }[] = [];

    private orderService = inject(OrderService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    private initOptions(): void {
        this.statusOptions = [
            { name: this.translate.instant('MAIL.COMMON.ALL_STATUSES'), value: null },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.DRAFT'), value: 'draft' },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.PENDING'), value: 'pending' },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.SIGNED'), value: 'signed' },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.CANCELLED'), value: 'cancelled' }
        ];

        this.statusFormOptions = [
            { name: this.translate.instant('MAIL.ORDERS.STATUS.DRAFT'), value: 'draft' },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.PENDING'), value: 'pending' },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.SIGNED'), value: 'signed' },
            { name: this.translate.instant('MAIL.ORDERS.STATUS.CANCELLED'), value: 'cancelled' }
        ];
    }

    constructor() {
        this.orderForm = this.fb.group({
            number: ['', Validators.required],
            date: [null, Validators.required],
            title: ['', Validators.required],
            description: [''],
            status: [null, Validators.required],
            signedBy: ['']
        });
    }

    ngOnInit() {
        this.initOptions();
        this.loadOrders();

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.initOptions();
        });
    }

    private loadOrders() {
        this.loading = true;
        this.orderService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.orders = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.orders];

        if (this.selectedStatus) {
            result = result.filter(o => o.status === this.selectedStatus);
        }

        this.filteredOrders = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedOrder = null;
        this.submitted = false;
        this.orderForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(order: Order) {
        this.isEditMode = true;
        this.selectedOrder = order;
        this.submitted = false;

        const statusOption = this.statusFormOptions.find(s => s.value === order.status);

        this.orderForm.patchValue({
            number: order.number,
            date: order.date ? new Date(order.date) : null,
            title: order.title,
            description: order.description || '',
            status: statusOption || null,
            signedBy: order.signedBy || ''
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedOrder = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.orderForm.invalid) {
            return;
        }

        const formValue = this.orderForm.value;
        const payload: OrderPayload = {
            number: formValue.number,
            date: formValue.date instanceof Date
                ? formValue.date.toISOString().split('T')[0]
                : formValue.date,
            title: formValue.title,
            description: formValue.description || undefined,
            status: formValue.status?.value || formValue.status,
            signedBy: formValue.signedBy || undefined
        };

        if (this.isEditMode && this.selectedOrder) {
            this.orderService
                .update(this.selectedOrder.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('MAIL.COMMON.SUCCESS'),
                            detail: this.translate.instant('MAIL.ORDERS.UPDATED')
                        });
                        this.loadOrders();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('MAIL.COMMON.ERROR'),
                            detail: this.translate.instant('MAIL.ORDERS.UPDATE_ERROR')
                        });
                    }
                });
        } else {
            this.orderService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('MAIL.COMMON.SUCCESS'),
                            detail: this.translate.instant('MAIL.ORDERS.CREATED')
                        });
                        this.loadOrders();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('MAIL.COMMON.ERROR'),
                            detail: this.translate.instant('MAIL.ORDERS.CREATE_ERROR')
                        });
                    }
                });
        }
    }

    openDeleteDialog(order: Order) {
        this.selectedOrder = order;
        this.displayDeleteDialog = true;
    }

    get deleteConfirmMessage(): string {
        return this.translate.instant('MAIL.COMMON.DELETE_CONFIRM') + ' ' +
               (this.selectedOrder?.number || '') + '?';
    }

    confirmDelete() {
        if (!this.selectedOrder) return;

        this.orderService
            .delete(this.selectedOrder.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('MAIL.COMMON.SUCCESS'),
                        detail: this.translate.instant('MAIL.ORDERS.DELETED')
                    });
                    this.loadOrders();
                    this.displayDeleteDialog = false;
                    this.selectedOrder = null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('MAIL.COMMON.ERROR'),
                        detail: this.translate.instant('MAIL.ORDERS.DELETE_ERROR')
                    });
                }
            });
    }

    getStatusLabel(status: OrderStatus): string {
        return this.orderService.getStatusLabel(status);
    }

    getStatusSeverity(status: OrderStatus): any {
        return this.orderService.getStatusSeverity(status);
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
