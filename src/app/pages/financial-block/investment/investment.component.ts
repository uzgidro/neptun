import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DatePicker } from 'primeng/datepicker';
import { FinancialDashboardService } from '../dashboard/services/financial-dashboard.service';
import { InvestmentService } from '@/core/services/investment.service';
import { InvestmentDto, InvestmentStatus, INVESTMENT_STATUS_LABELS } from '@/core/interfaces/investment';
import { FileResponse } from '@/core/interfaces/files';
import { ApiService } from '@/core/services/api.service';

@Component({
    selector: 'app-investment',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        SelectComponent,
        Button,
        DatePickerComponent,
        DialogComponent,
        PrimeTemplate,
        ReactiveFormsModule,
        TextareaComponent,
        InputNumberdComponent,
        TooltipModule,
        FileUploadComponent,
        FileViewerComponent,
        FileListComponent,
        InputTextComponent,
        FormsModule,
        DatePicker
    ],
    templateUrl: './investment.component.html',
    styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
    investments: InvestmentDto[] = [];
    filteredInvestments: InvestmentDto[] = [];

    // Dialog
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentInvestmentId: number | null = null;
    form!: FormGroup;

    // Files
    selectedFiles: File[] = [];
    currentInvestment: InvestmentDto | null = null;
    showFilesDialog: boolean = false;
    selectedInvestmentForFiles: InvestmentDto | null = null;
    existingFilesToKeep: number[] = [];

    // Date range filter
    dateRange: Date[] | null = null;

    private fb: FormBuilder = inject(FormBuilder);
    private messageService: MessageService = inject(MessageService);
    private dashboardService = inject(FinancialDashboardService);
    private investmentService = inject(InvestmentService);
    private apiService = inject(ApiService);

    statusOptions: { name: string; value: InvestmentStatus }[] = [
        { name: 'Запланировано', value: 'Planned' },
        { name: 'В процессе', value: 'In Progress' },
        { name: 'Завершено', value: 'Completed' },
        { name: 'Отменено', value: 'Cancelled' }
    ];

    ngOnInit(): void {
        this.form = this.fb.group({
            project_name: this.fb.control<string | null>(null),
            status: this.fb.control<{ name: string; value: InvestmentStatus } | null>(null),
            amount: this.fb.control<number | null>(null),
            date: this.fb.control<Date | null>(null),
            comment: this.fb.control<string | null>(null)
        });

        this.loadInvestments();
    }

    private loadInvestments(): void {
        this.isLoading = true;
        this.investmentService.getInvestments().subscribe({
            next: (data) => {
                this.investments = data;
                this.applyFilter();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка загрузки',
                    detail: 'Не удалось загрузить инвестиционные проекты'
                });
                console.error(err);
            },
            complete: () => {
                this.isLoading = false;
                this.updateDashboardData();
            }
        });
    }

    private updateDashboardData(): void {
        this.dashboardService.updateInvestment({
            totalDebit: 0,
            totalCredit: 0,
            balance: 0,
            projectsCount: this.investments.length
        });
    }

    applyFilter(): void {
        let filtered = [...this.investments];

        // Filter by date range
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            const startDate = new Date(this.dateRange[0]);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(this.dateRange[1]);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter((i) => {
                const itemDate = new Date(i.date);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        this.filteredInvestments = filtered;
    }

    onDateRangeChange(): void {
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            this.applyFilter();
            const startFormatted = this.dateRange[0].toLocaleDateString('ru-RU');
            const endFormatted = this.dateRange[1].toLocaleDateString('ru-RU');
            this.messageService.add({
                severity: 'info',
                summary: 'Диапазон выбран',
                detail: `${startFormatted} - ${endFormatted}`,
                life: 2000
            });
        }
    }

    onDateRangeClear(): void {
        this.dateRange = null;
        this.applyFilter();
        this.messageService.add({
            severity: 'info',
            summary: 'Диапазон сброшен',
            detail: 'Показаны все даты',
            life: 2000
        });
    }

    get activePhaseCount(): number {
        return this.filteredInvestments.filter(i => i.status === 'In Progress').length;
    }

    get inDevelopmentCount(): number {
        return this.filteredInvestments.filter(i => i.status === 'Planned').length;
    }

    get completedCount(): number {
        return this.filteredInvestments.filter(i => i.status === 'Completed').length;
    }

    get cancelledCount(): number {
        return this.filteredInvestments.filter(i => i.status === 'Cancelled').length;
    }

    get totalAmount(): number {
        return this.filteredInvestments.reduce((sum, i) => sum + i.amount, 0);
    }

    // Dialog methods
    openNew() {
        this.isEditMode = false;
        this.currentInvestmentId = null;
        this.currentInvestment = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editInvestment(investment: InvestmentDto) {
        this.isEditMode = true;
        this.currentInvestmentId = investment.id;
        this.currentInvestment = investment;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        this.existingFilesToKeep = investment.files?.map((f) => f.id) || [];

        // Find the status option that matches the backend value
        const statusOption = this.statusOptions.find(opt => opt.value === investment.status);

        this.form.patchValue({
            project_name: investment.project_name,
            status: statusOption || null,
            amount: investment.amount,
            date: investment.date,
            comment: investment.comment
        });

        this.isFormOpen = true;
    }

    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) return;

        this.isLoading = true;
        const rawPayload = this.form.getRawValue();

        // Build FormData
        const formData = new FormData();
        formData.append('project_name', rawPayload.project_name || '');
        formData.append('status', rawPayload.status?.value || 'Planned');
        formData.append('amount', (rawPayload.amount || 0).toString());

        // Format date using ApiService
        if (rawPayload.date) {
            formData.append('date', this.apiService['dateToYMD'](rawPayload.date));
        }

        if (rawPayload.comment) {
            formData.append('comment', rawPayload.comment);
        }

        // Add new files
        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        // In edit mode, specify which files to keep
        if (this.isEditMode && this.existingFilesToKeep.length > 0) {
            formData.append('file_ids', this.existingFilesToKeep.join(','));
        }

        if (this.isEditMode && this.currentInvestmentId) {
            this.investmentService.updateInvestment(this.currentInvestmentId, formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Проект обновлен'
                    });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка обновления',
                        detail: err.message || 'Не удалось обновить проект'
                    });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
        } else {
            this.investmentService.createInvestment(formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Проект добавлен'
                    });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка создания',
                        detail: err.message || 'Не удалось создать проект'
                    });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
        }
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentInvestmentId = null;
        this.currentInvestment = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.form.reset();

        // Reload data from API
        this.loadInvestments();
    }

    deleteInvestment(id: number) {
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            this.investmentService.deleteInvestment(id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Проект удален'
                    });
                    this.loadInvestments();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка удаления',
                        detail: err.message || 'Не удалось удалить проект'
                    });
                    console.error(err);
                }
            });
        }
    }

    // File methods
    onFileSelect(files: File[]) {
        this.selectedFiles = files;
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    removeExistingFile(fileId: number) {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        if (this.currentInvestment?.files) {
            this.currentInvestment = {
                ...this.currentInvestment,
                files: this.currentInvestment.files.filter((f) => f.id !== fileId)
            };
        }
    }

    showFiles(investment: InvestmentDto) {
        this.selectedInvestmentForFiles = investment;
        this.showFilesDialog = true;
    }

    getStatusLabel(status: InvestmentStatus): string {
        return INVESTMENT_STATUS_LABELS[status];
    }
}
