import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Call, CallPayload, CallType, CallStatus } from '@/core/interfaces/call';
import { CallService } from '@/core/services/call.service';
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
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-calls',
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
    templateUrl: './calls.component.html',
    styleUrl: './calls.component.scss'
})
export class CallsComponent implements OnInit, OnDestroy {
    calls: Call[] = [];
    filteredCalls: Call[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedCall: Call | null = null;

    callForm: FormGroup;

    selectedType: CallType | null = null;
    selectedStatus: CallStatus | null = null;

    typeOptions = [
        { name: 'Все типы', value: null },
        { name: 'Входящий', value: 'incoming' },
        { name: 'Исходящий', value: 'outgoing' },
        { name: 'Пропущенный', value: 'missed' }
    ];

    typeFormOptions = [
        { name: 'Входящий', value: 'incoming' },
        { name: 'Исходящий', value: 'outgoing' },
        { name: 'Пропущенный', value: 'missed' }
    ];

    statusOptions = [
        { name: 'Все статусы', value: null },
        { name: 'Завершён', value: 'completed' },
        { name: 'Нет ответа', value: 'no_answer' },
        { name: 'Занято', value: 'busy' },
        { name: 'Отменён', value: 'cancelled' }
    ];

    statusFormOptions = [
        { name: 'Завершён', value: 'completed' },
        { name: 'Нет ответа', value: 'no_answer' },
        { name: 'Занято', value: 'busy' },
        { name: 'Отменён', value: 'cancelled' }
    ];

    private callService = inject(CallService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    constructor() {
        this.callForm = this.fb.group({
            date: [null, Validators.required],
            time: ['', Validators.required],
            type: [null, Validators.required],
            callerName: ['', Validators.required],
            callerPhone: ['', Validators.required],
            receiverName: [''],
            receiverPhone: [''],
            duration: [null],
            status: [null, Validators.required],
            notes: ['']
        });
    }

    ngOnInit() {
        this.loadCalls();
    }

    private loadCalls() {
        this.loading = true;
        this.callService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.calls = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.calls];

        if (this.selectedType) {
            result = result.filter(c => c.type === this.selectedType);
        }

        if (this.selectedStatus) {
            result = result.filter(c => c.status === this.selectedStatus);
        }

        this.filteredCalls = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedCall = null;
        this.submitted = false;
        this.callForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(call: Call) {
        this.isEditMode = true;
        this.selectedCall = call;
        this.submitted = false;

        const typeOption = this.typeFormOptions.find(t => t.value === call.type);
        const statusOption = this.statusFormOptions.find(s => s.value === call.status);

        this.callForm.patchValue({
            date: call.date ? new Date(call.date) : null,
            time: call.time || '',
            type: typeOption || null,
            callerName: call.callerName,
            callerPhone: call.callerPhone,
            receiverName: call.receiverName || '',
            receiverPhone: call.receiverPhone || '',
            duration: call.duration || null,
            status: statusOption || null,
            notes: call.notes || ''
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedCall = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.callForm.invalid) {
            return;
        }

        const formValue = this.callForm.value;
        const payload: CallPayload = {
            date: formValue.date instanceof Date
                ? formValue.date.toISOString().split('T')[0]
                : formValue.date,
            time: formValue.time,
            type: formValue.type?.value || formValue.type,
            callerName: formValue.callerName,
            callerPhone: formValue.callerPhone,
            receiverName: formValue.receiverName || undefined,
            receiverPhone: formValue.receiverPhone || undefined,
            duration: formValue.duration || undefined,
            status: formValue.status?.value || formValue.status,
            notes: formValue.notes || undefined
        };

        if (this.isEditMode && this.selectedCall) {
            this.callService
                .update(this.selectedCall.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Звонок обновлён' });
                        this.loadCalls();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить звонок' });
                    }
                });
        } else {
            this.callService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Звонок добавлен' });
                        this.loadCalls();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось добавить звонок' });
                    }
                });
        }
    }

    openDeleteDialog(call: Call) {
        this.selectedCall = call;
        this.displayDeleteDialog = true;
    }

    confirmDelete() {
        if (!this.selectedCall) return;

        this.callService
            .delete(this.selectedCall.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Звонок удалён' });
                    this.loadCalls();
                    this.displayDeleteDialog = false;
                    this.selectedCall = null;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить звонок' });
                }
            });
    }

    getTypeLabel(type: CallType): string {
        return this.callService.getTypeLabel(type);
    }

    getTypeSeverity(type: CallType): any {
        return this.callService.getTypeSeverity(type);
    }

    getTypeIcon(type: CallType): string {
        if (type === 'incoming') return 'pi pi-arrow-down-left';
        if (type === 'outgoing') return 'pi pi-arrow-up-right';
        return 'pi pi-times';
    }

    getStatusLabel(status: CallStatus): string {
        return this.callService.getStatusLabel(status);
    }

    getStatusSeverity(status: CallStatus): any {
        return this.callService.getStatusSeverity(status);
    }

    formatDuration(seconds: number | undefined): string {
        return this.callService.formatDuration(seconds);
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
