import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { Button } from 'primeng/button';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { FinancialDashboardService } from '../../financial-block/dashboard/services/financial-dashboard.service';
import { InvestmentService } from '@/core/services/investment.service';
import { InvestmentDto, InvestmentStatus } from '@/core/interfaces/investment';

@Component({
    selector: 'app-invest-perspective-projects',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        SelectComponent,
        Button,
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
        FormsModule
    ],
    templateUrl: './invest-perspective-projects.component.html',
    styleUrl: './invest-perspective-projects.component.scss'
})
export class InvestPerspectiveProjectsComponent implements OnInit {
    investments: InvestmentDto[] = [];
    filteredInvestments: InvestmentDto[] = [];

    // Project stages
    projectStages = [
        { key: 'Terms of reference', label: 'ТЗ' },
        { key: 'Feasibility study', label: 'ТЭО' },
        { key: 'Expertise', label: 'Экспертиза' },
        { key: 'Statement', label: 'Утверждение' }
    ];

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

    statusOptions: InvestmentStatus[] = [];

    ngOnInit(): void {
        this.form = this.fb.group({
            project_name: this.fb.control<string | null>(null),
            status: this.fb.control<InvestmentStatus | null>(null),
            amount: this.fb.control<number | null>(null),
            date: this.fb.control<Date | null>(null),
            comment: this.fb.control<string | null>(null)
        });

        this.loadStatuses();
        this.loadInvestments();
    }

    private loadStatuses(): void {
        this.investmentService.getStatuses().subscribe({
            next: (statuses) => {
                this.statusOptions = statuses;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка загрузки',
                    detail: 'Не удалось загрузить статусы'
                });
                console.error(err);
            }
        });
    }

    private loadInvestments(): void {
        this.isLoading = true;
        this.investmentService.getInvestments().subscribe({
            next: (data) => {
                console.log(data);
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
        }

        this.filteredInvestments = filtered;
    }

    getStageCount(stageKey: string): number {
        return this.filteredInvestments.filter((i) => i.status.description === stageKey).length;
    }

    get totalAmount(): number {
        return this.filteredInvestments.reduce((sum, i) => sum + i.cost, 0);
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
        const statusOption = this.statusOptions.find((opt) => opt.name === investment.status.name);

        this.form.patchValue({
            project_name: investment.name,
            status: statusOption || null,
            amount: investment.cost,
            comment: investment.comments
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
        formData.append('name', rawPayload.project_name || '');
        if (rawPayload.status?.id) {
            formData.append('status_id', rawPayload.status.id.toString());
        }
        formData.append('cost', (rawPayload.amount || 0).toString());

        if (rawPayload.comment) {
            formData.append('comments', rawPayload.comment);
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

    // Stage helpers
    isStageActive(statusDescription: string, stageKey: string): boolean {
        return statusDescription === stageKey;
    }

    isStageCompleted(statusDescription: string, stageKey: string): boolean {
        const currentIndex = this.projectStages.findIndex((s) => s.key === statusDescription);
        const stageIndex = this.projectStages.findIndex((s) => s.key === stageKey);
        return currentIndex > stageIndex;
    }

    getStageLabel(statusDescription: string): string {
        const stage = this.projectStages.find((s) => s.key === statusDescription);
        return stage ? stage.label : statusDescription;
    }
}
