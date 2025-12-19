import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
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

type Status = 'Новый' | 'В разработке' | 'Выполнено';
type OperationFilter = 'Все' | 'Кредит' | 'Дебит';
type Priority = 'Высокий' | 'Средний' | 'Низкий';

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
    operation_type: 'Кредит' | 'Дебит';
    amount: number;
    priority: Priority;
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
        ChartModule,
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
        FormsModule
    ],
    templateUrl: './investment.component.html',
    styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
    investments: InvestmentData[] = [];
    filteredInvestments: InvestmentData[] = [];
    selectedOperation: { name: string; value: string } | undefined;

    chartData: any;
    chartOptions: any;
    lineChartData: any;
    lineChartOptions: any;

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

    private fb: FormBuilder = inject(FormBuilder);
    private messageService: MessageService = inject(MessageService);

    operationOptions = [
        { name: 'Все', value: 'Все' },
        { name: 'Кредит', value: 'Кредит' },
        { name: 'Дебит', value: 'Дебит' }
    ];

    statusOptions = [
        { name: 'Новый', value: 'Новый' },
        { name: 'В разработке', value: 'В разработке' },
        { name: 'Выполнено', value: 'Выполнено' }
    ];

    priorityOptions = [
        { name: 'Высокий', value: 'Высокий' },
        { name: 'Средний', value: 'Средний' },
        { name: 'Низкий', value: 'Низкий' }
    ];

    operationTypeOptions = [
        { name: 'Дебит', value: 'Дебит' },
        { name: 'Кредит', value: 'Кредит' }
    ];

    ngOnInit(): void {
        this.selectedOperation = this.operationOptions[0];

        // Initialize form
        this.form = this.fb.group({
            project_name: this.fb.control<string | null>(null),
            status: this.fb.control<{ name: string; value: Status } | null>(null),
            operation_type: this.fb.control<{ name: string; value: 'Дебит' | 'Кредит' } | null>(null),
            amount: this.fb.control<number | null>(null),
            priority: this.fb.control<{ name: string; value: Priority } | null>(null),
            date: this.fb.control<Date | null>(null),
            comment: this.fb.control<string | null>(null)
        });

        this.investments = [];

        this.chartOptions = { plugins: { legend: { position: 'bottom' } } };
        this.lineChartOptions = {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        };

        this.applyFilter();
    }

    applyFilter(): void {
        if (!this.selectedOperation) this.selectedOperation = this.operationOptions[0];
        const filterValue = this.selectedOperation.value;

        this.filteredInvestments = filterValue === 'Все' ? [...this.investments] : this.investments.filter((i) => i.operation_type === filterValue);

        this.updateChart();
        this.updateLineChart();
    }

    updateChart(): void {
        const debitTotal = this.filteredInvestments.filter((i) => i.operation_type === 'Дебит').reduce((sum, i) => sum + i.amount, 0);
        const creditTotal = this.filteredInvestments.filter((i) => i.operation_type === 'Кредит').reduce((sum, i) => sum + i.amount, 0);
        const filterValue = this.selectedOperation?.value || 'Все';

        if (filterValue === 'Все') {
            this.chartData = { labels: ['Дебит', 'Кредит'], datasets: [{ data: [debitTotal, creditTotal], backgroundColor: ['#2e7d32', '#d32f2f'] }] };
        } else if (filterValue === 'Дебит') {
            this.chartData = { labels: ['Дебит'], datasets: [{ data: [debitTotal], backgroundColor: ['#2e7d32'] }] };
        } else {
            this.chartData = { labels: ['Кредит'], datasets: [{ data: [creditTotal], backgroundColor: ['#d32f2f'] }] };
        }
    }

    updateLineChart(): void {
        const map = new Map<string, { debit: number; credit: number }>();
        this.filteredInvestments.forEach((item) => {
            const dateKey = item.date.toISOString().split('T')[0];
            if (!map.has(dateKey)) map.set(dateKey, { debit: 0, credit: 0 });
            const entry = map.get(dateKey)!;
            if (item.operation_type === 'Дебит') entry.debit += item.amount;
            else entry.credit += item.amount;
        });

        const labels = Array.from(map.keys()).sort();
        this.lineChartData = {
            labels,
            datasets: [
                { label: 'Дебит', data: labels.map((d) => map.get(d)!.debit), borderColor: '#2e7d32', backgroundColor: 'rgba(46,125,50,0.2)', tension: 0.4 },
                { label: 'Кредит', data: labels.map((d) => map.get(d)!.credit), borderColor: '#d32f2f', backgroundColor: 'rgba(211,47,47,0.2)', tension: 0.4 }
            ]
        };
    }

    get totalDebit(): number {
        return this.filteredInvestments.filter((i) => i.operation_type === 'Дебит').reduce((sum, i) => sum + i.amount, 0);
    }

    get totalCredit(): number {
        return this.filteredInvestments.filter((i) => i.operation_type === 'Кредит').reduce((sum, i) => sum + i.amount, 0);
    }

    get balance(): number {
        return this.totalDebit - this.totalCredit;
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
            operation_type: this.operationTypeOptions.find((o) => o.value === investment.operation_type) || null,
            amount: investment.amount,
            priority: this.priorityOptions.find((p) => p.value === investment.priority) || null,
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
            status: rawPayload.status?.value || 'Новый',
            operation_type: rawPayload.operation_type?.value || 'Дебит',
            amount: rawPayload.amount || 0,
            priority: rawPayload.priority?.value || 'Средний',
            date: rawPayload.date || new Date(),
            comment: rawPayload.comment || '',
            files: []
        };

        // Handle files
        if (this.isEditMode && this.currentInvestment) {
            // Keep existing files that weren't removed
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
            this.messageService.add({ severity: 'success', summary: 'Проект обновлен' });
        } else {
            this.investments.push(investmentData);
            this.messageService.add({ severity: 'success', summary: 'Проект добавлен' });
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
    }

    deleteInvestment(id: number) {
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            this.investments = this.investments.filter((inv) => inv.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Проект удален' });
            this.applyFilter();
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
