import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PersonnelLoss, PersonnelLossPayload, PersonnelLossStats, LossType } from '@/core/interfaces/personnel-loss';
import { PersonnelLossService } from '@/core/services/personnel-loss.service';
import { OrganizationService } from '@/core/services/organization.service';
import { Organization } from '@/core/interfaces/organizations';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { Avatar } from 'primeng/avatar';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { ChartModule } from 'primeng/chart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-personnel-loss',
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
        Avatar,
        ProgressSpinner,
        DialogComponent,
        InputTextComponent,
        SelectComponent,
        TextareaComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        ChartModule,
        TranslateModule
    ],
    templateUrl: './personnel-loss.component.html',
    styleUrl: './personnel-loss.component.scss'
})
export class PersonnelLossComponent implements OnInit, OnDestroy {
    losses: PersonnelLoss[] = [];
    filteredLosses: PersonnelLoss[] = [];
    deceased: PersonnelLoss[] = [];
    stats: PersonnelLossStats | null = null;
    organizations: Organization[] = [];

    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedLoss: PersonnelLoss | null = null;

    lossForm: FormGroup;

    selectedType: LossType | null = null;
    selectedYear: number | null = null;

    lossTypes: { label: string; value: LossType | null }[] = [];
    lossTypeOptions: { name: string; value: LossType }[] = [];
    years: { label: string; value: number | null }[] = [];

    chartData: any;
    chartOptions: any;

    private personnelLossService = inject(PersonnelLossService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    private initOptions(): void {
        this.lossTypes = [
            { label: this.translate.instant('HRM.PERSONNEL_LOSS.ALL_TYPES'), value: null },
            { label: this.translate.instant('HRM.PERSONNEL_LOSS.DISMISSAL'), value: 'dismissal' },
            { label: this.translate.instant('HRM.PERSONNEL_LOSS.DEATH'), value: 'death' },
            { label: this.translate.instant('HRM.PERSONNEL_LOSS.RETIREMENT'), value: 'retirement' },
            { label: this.translate.instant('HRM.PERSONNEL_LOSS.TRANSFER'), value: 'transfer' },
            { label: this.translate.instant('HRM.PERSONNEL_LOSS.OTHER'), value: 'other' }
        ];

        this.lossTypeOptions = [
            { name: this.translate.instant('HRM.PERSONNEL_LOSS.DISMISSAL'), value: 'dismissal' },
            { name: this.translate.instant('HRM.PERSONNEL_LOSS.DEATH'), value: 'death' },
            { name: this.translate.instant('HRM.PERSONNEL_LOSS.RETIREMENT'), value: 'retirement' },
            { name: this.translate.instant('HRM.PERSONNEL_LOSS.TRANSFER'), value: 'transfer' },
            { name: this.translate.instant('HRM.PERSONNEL_LOSS.OTHER'), value: 'other' }
        ];
    }

    constructor() {
        this.lossForm = this.fb.group({
            name: ['', Validators.required],
            lossType: [null, Validators.required],
            lossDate: [null, Validators.required],
            hireDate: [null],
            organization_id: [null],
            reason: [''],
            achievements: [''],
            notes: ['']
        });

        this.initYears();
    }

    ngOnInit() {
        this.initOptions();
        this.loadData();
        this.loadOrganizations();

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.initOptions();
            this.initYears();
            this.initChart();
        });
    }

    private initYears() {
        const currentYear = new Date().getFullYear();
        this.years = [{ label: this.translate.instant('HRM.PERSONNEL_LOSS.ALL_YEARS'), value: null }];
        for (let year = currentYear; year >= currentYear - 10; year--) {
            this.years.push({ label: year.toString(), value: year });
        }
    }

    private loadData() {
        this.loading = true;

        this.personnelLossService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.losses = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });

        this.personnelLossService
            .getStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.stats = stats;
                    this.initChart();
                }
            });

        this.personnelLossService
            .getDeceased()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.deceased = data;
                }
            });
    }

    private loadOrganizations() {
        this.organizationService
            .getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.organizations = data;
                }
            });
    }

    private initChart() {
        if (!this.stats) return;

        this.chartData = {
            labels: this.stats.byMonth.map(m => m.month),
            datasets: [
                {
                    label: this.translate.instant('HRM.PERSONNEL_LOSS.LOSSES_BY_MONTH'),
                    data: this.stats.byMonth.map(m => m.count),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        };
    }

    applyFilters() {
        let result = [...this.losses];

        if (this.selectedType) {
            result = result.filter(l => l.lossType === this.selectedType);
        }

        if (this.selectedYear) {
            result = result.filter(l => new Date(l.lossDate).getFullYear() === this.selectedYear);
        }

        this.filteredLosses = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedLoss = null;
        this.submitted = false;
        this.lossForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(loss: PersonnelLoss) {
        this.isEditMode = true;
        this.selectedLoss = loss;
        this.submitted = false;

        const lossTypeOption = this.lossTypeOptions.find(t => t.value === loss.lossType);
        const orgOption = this.organizations.find(o => o.id === loss.organization?.id);

        this.lossForm.patchValue({
            name: loss.name,
            lossType: lossTypeOption || null,
            lossDate: loss.lossDate ? new Date(loss.lossDate) : null,
            hireDate: loss.hireDate ? new Date(loss.hireDate) : null,
            organization_id: orgOption || null,
            reason: loss.reason || '',
            achievements: loss.achievements || '',
            notes: loss.notes || ''
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedLoss = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.lossForm.invalid) {
            return;
        }

        const formValue = this.lossForm.value;
        const payload: PersonnelLossPayload = {
            name: formValue.name,
            lossType: formValue.lossType?.value || formValue.lossType,
            lossDate: formValue.lossDate instanceof Date
                ? formValue.lossDate.toISOString().split('T')[0]
                : formValue.lossDate,
            hireDate: formValue.hireDate instanceof Date
                ? formValue.hireDate.toISOString().split('T')[0]
                : formValue.hireDate,
            organization_id: formValue.organization_id?.id || null,
            reason: formValue.reason || null,
            achievements: formValue.achievements || null,
            notes: formValue.notes || null
        };

        if (this.isEditMode && this.selectedLoss) {
            this.personnelLossService
                .update(this.selectedLoss.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SAVE'), detail: this.translate.instant('HRM.PERSONNEL_LOSS.SUCCESS_UPDATED') });
                        this.loadData();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.CANCEL'), detail: this.translate.instant('HRM.PERSONNEL_LOSS.ERROR_UPDATE') });
                    }
                });
        } else {
            this.personnelLossService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SAVE'), detail: this.translate.instant('HRM.PERSONNEL_LOSS.SUCCESS_CREATED') });
                        this.loadData();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.CANCEL'), detail: this.translate.instant('HRM.PERSONNEL_LOSS.ERROR_CREATE') });
                    }
                });
        }
    }

    openDeleteDialog(loss: PersonnelLoss) {
        this.selectedLoss = loss;
        this.displayDeleteDialog = true;
    }

    confirmDelete() {
        if (!this.selectedLoss) return;

        this.personnelLossService
            .delete(this.selectedLoss.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.DELETE'), detail: this.translate.instant('HRM.PERSONNEL_LOSS.SUCCESS_DELETED') });
                    this.loadData();
                    this.displayDeleteDialog = false;
                    this.selectedLoss = null;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.CANCEL'), detail: this.translate.instant('HRM.PERSONNEL_LOSS.ERROR_DELETE') });
                }
            });
    }

    getLossTypeLabel(type: LossType): string {
        return this.personnelLossService.getLossTypeLabel(type);
    }

    getLossTypeSeverity(type: LossType): any {
        return this.personnelLossService.getLossTypeSeverity(type);
    }

    getLossTypeIcon(type: LossType): string {
        return this.personnelLossService.getLossTypeIcon(type);
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    getAvatarLabel(name: string): string {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getYearsLabel(years: number | null | undefined): string {
        if (!years) return '—';
        const lastDigit = years % 10;
        const lastTwoDigits = years % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${years} ${this.translate.instant('HRM.PERSONNEL_LOSS.YEARS_LABEL_MANY')}`;
        if (lastDigit === 1) return `${years} ${this.translate.instant('HRM.PERSONNEL_LOSS.YEAR_LABEL')}`;
        if (lastDigit >= 2 && lastDigit <= 4) return `${years} ${this.translate.instant('HRM.PERSONNEL_LOSS.YEARS_LABEL')}`;
        return `${years} ${this.translate.instant('HRM.PERSONNEL_LOSS.YEARS_LABEL_MANY')}`;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
