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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type Status = 'Активная фаза' | 'В разработке';

interface FileData {
    id: number;
    file_name: string;
    size_bytes: number;
    url: string;
    file?: File;
}

interface InvestmentData {
    id: number;
    project_name: string;
    status: Status;
    amount: number;
    date: Date;
    comment: string;
    files?: FileData[];
}

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
        DatePicker,
        TranslateModule
    ],
    templateUrl: './investment.component.html',
    styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
    investments: InvestmentData[] = [];
    filteredInvestments: InvestmentData[] = [];

    // Dialog
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentInvestmentId: number | null = null;
    form!: FormGroup;

    // Files
    selectedFiles: File[] = [];
    currentInvestment: InvestmentData | null = null;
    showFilesDialog: boolean = false;
    selectedInvestmentForFiles: InvestmentData | null = null;
    existingFilesToKeep: number[] = [];

    // Date range filter
    dateRange: Date[] | null = null;

    private fb: FormBuilder = inject(FormBuilder);
    private messageService: MessageService = inject(MessageService);
    private dashboardService = inject(FinancialDashboardService);
    private translate = inject(TranslateService);

    statusOptions: { name: string; value: string }[] = [];

    ngOnInit(): void {
        this.initTranslations();
        this.translate.onLangChange.subscribe(() => this.initTranslations());
        this.form = this.fb.group({
            project_name: this.fb.control<string | null>(null),
            status: this.fb.control<{ name: string; value: Status } | null>(null),
            amount: this.fb.control<number | null>(null),
            date: this.fb.control<Date | null>(null),
            comment: this.fb.control<string | null>(null)
        });

        this.investments = [];
        this.applyFilter();
        this.updateDashboardData();
    }

    private initTranslations(): void {
        this.statusOptions = [
            { name: this.translate.instant('FINANCIAL_BLOCK.INVESTMENT.ACTIVE_PHASE'), value: 'Активная фаза' },
            { name: this.translate.instant('FINANCIAL_BLOCK.INVESTMENT.IN_DEVELOPMENT'), value: 'В разработке' }
        ];
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
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SELECT_DATE_RANGE'),
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
            summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.CLEAR'),
            detail: this.translate.instant('FINANCIAL_BLOCK.COMMON.ALL'),
            life: 2000
        });
    }

    get activePhaseCount(): number {
        return this.filteredInvestments.filter(i => i.status === 'Активная фаза').length;
    }

    get inDevelopmentCount(): number {
        return this.filteredInvestments.filter(i => i.status === 'В разработке').length;
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

    editInvestment(investment: InvestmentData) {
        this.isEditMode = true;
        this.currentInvestmentId = investment.id;
        this.currentInvestment = investment;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        this.existingFilesToKeep = investment.files?.map((f) => f.id) || [];

        this.form.patchValue({
            project_name: investment.project_name,
            status: this.statusOptions.find((s) => s.value === investment.status) || null,
            amount: investment.amount,
            date: investment.date,
            comment: investment.comment
        });

        this.isFormOpen = true;
    }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;
        const rawPayload = this.form.getRawValue();

        const investmentData: InvestmentData = {
            id: this.isEditMode && this.currentInvestmentId ? this.currentInvestmentId : Date.now(),
            project_name: rawPayload.project_name || '',
            status: rawPayload.status?.value || 'Активная фаза',
            amount: rawPayload.amount || 0,
            date: rawPayload.date || new Date(),
            comment: rawPayload.comment || '',
            files: []
        };

        // Handle files
        if (this.isEditMode && this.currentInvestment) {
            const existingFiles = this.currentInvestment.files?.filter((f) => this.existingFilesToKeep.includes(f.id)) || [];
            investmentData.files = [...existingFiles];
        }

        // Add new files
        const newFiles: FileData[] = this.selectedFiles.map((file, index) => ({
            id: Date.now() + index,
            file_name: file.name,
            size_bytes: file.size,
            url: URL.createObjectURL(file),
            file: file
        }));

        investmentData.files = [...(investmentData.files || []), ...newFiles];

        if (this.isEditMode && this.currentInvestmentId) {
            const index = this.investments.findIndex((inv) => inv.id === this.currentInvestmentId);
            if (index !== -1) {
                this.investments[index] = investmentData;
            }
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.INVESTMENT.PROJECT_UPDATED')
            });
        } else {
            this.investments.push(investmentData);
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.INVESTMENT.PROJECT_ADDED')
            });
        }

        this.closeDialog();
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
        this.applyFilter();
        this.updateDashboardData();
    }

    deleteInvestment(id: number) {
        if (confirm(this.translate.instant('FINANCIAL_BLOCK.INVESTMENT.DELETE_CONFIRM'))) {
            this.investments = this.investments.filter((inv) => inv.id !== id);
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('FINANCIAL_BLOCK.COMMON.SUCCESS'),
                detail: this.translate.instant('FINANCIAL_BLOCK.INVESTMENT.PROJECT_DELETED')
            });
            this.applyFilter();
            this.updateDashboardData();
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
            this.currentInvestment.files = this.currentInvestment.files.filter((f) => f.id !== fileId);
        }
    }

    showFiles(investment: InvestmentData) {
        this.selectedInvestmentForFiles = investment;
        this.showFilesDialog = true;
    }
}
