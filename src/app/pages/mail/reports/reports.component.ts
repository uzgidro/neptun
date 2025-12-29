import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Report, ReportPayload, ReportStatus } from '@/core/interfaces/report';
import { ReportService } from '@/core/services/report.service';
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

@Component({
    selector: 'app-reports',
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
        DeleteConfirmationComponent
    ],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
    reports: Report[] = [];
    filteredReports: Report[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedReport: Report | null = null;

    reportForm: FormGroup;

    selectedStatus: ReportStatus | null = null;

    statusOptions = [
        { name: 'Все статусы', value: null },
        { name: 'На рассмотрении', value: 'pending' },
        { name: 'Одобрен', value: 'approved' },
        { name: 'Отклонён', value: 'rejected' }
    ];

    statusFormOptions = [
        { name: 'На рассмотрении', value: 'pending' },
        { name: 'Одобрен', value: 'approved' },
        { name: 'Отклонён', value: 'rejected' }
    ];

    private reportService = inject(ReportService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    constructor() {
        this.reportForm = this.fb.group({
            number: ['', Validators.required],
            date: [null, Validators.required],
            from: ['', Validators.required],
            to: ['', Validators.required],
            subject: ['', Validators.required],
            content: [''],
            status: [null, Validators.required],
            resolution: ['']
        });
    }

    ngOnInit() {
        this.loadReports();
    }

    private loadReports() {
        this.loading = true;
        this.reportService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.reports = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.reports];

        if (this.selectedStatus) {
            result = result.filter(r => r.status === this.selectedStatus);
        }

        this.filteredReports = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedReport = null;
        this.submitted = false;
        this.reportForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(report: Report) {
        this.isEditMode = true;
        this.selectedReport = report;
        this.submitted = false;

        const statusOption = this.statusFormOptions.find(s => s.value === report.status);

        this.reportForm.patchValue({
            number: report.number,
            date: report.date ? new Date(report.date) : null,
            from: report.from,
            to: report.to,
            subject: report.subject,
            content: report.content || '',
            status: statusOption || null,
            resolution: report.resolution || ''
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedReport = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.reportForm.invalid) {
            return;
        }

        const formValue = this.reportForm.value;
        const payload: ReportPayload = {
            number: formValue.number,
            date: formValue.date instanceof Date
                ? formValue.date.toISOString().split('T')[0]
                : formValue.date,
            from: formValue.from,
            to: formValue.to,
            subject: formValue.subject,
            content: formValue.content || undefined,
            status: formValue.status?.value || formValue.status,
            resolution: formValue.resolution || undefined
        };

        if (this.isEditMode && this.selectedReport) {
            this.reportService
                .update(this.selectedReport.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Рапорт обновлён' });
                        this.loadReports();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить рапорт' });
                    }
                });
        } else {
            this.reportService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Рапорт создан' });
                        this.loadReports();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать рапорт' });
                    }
                });
        }
    }

    openDeleteDialog(report: Report) {
        this.selectedReport = report;
        this.displayDeleteDialog = true;
    }

    confirmDelete() {
        if (!this.selectedReport) return;

        this.reportService
            .delete(this.selectedReport.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Рапорт удалён' });
                    this.loadReports();
                    this.displayDeleteDialog = false;
                    this.selectedReport = null;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить рапорт' });
                }
            });
    }

    getStatusLabel(status: ReportStatus): string {
        return this.reportService.getStatusLabel(status);
    }

    getStatusSeverity(status: ReportStatus): any {
        return this.reportService.getStatusSeverity(status);
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
