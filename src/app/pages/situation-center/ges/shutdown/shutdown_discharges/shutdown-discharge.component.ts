import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService, PrimeTemplate, SortEvent } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DischargeService } from '@/core/services/discharge.service';
import { ApiService } from '@/core/services/api.service';
import { DischargeCreatePayload, DischargeUpdatePayload, IdleDischargeResponse } from '@/core/interfaces/discharge';
import { Button } from 'primeng/button';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Organization } from '@/core/interfaces/organizations';
import { AuthService } from '@/core/services/auth.service';
import { dateRangeValidator } from '@/core/validators/date-range.validator';
import { TooltipModule } from 'primeng/tooltip';
import { OrganizationService } from '@/core/services/organization.service';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { downloadBlob } from '@/core/utils/download';
import { ScService } from '@/core/services/sc.service';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse } from '@/core/interfaces/ges-report';

type SortableDischarge = IdleDischargeResponse & { configSortKey: number };

@Component({
    selector: 'app-shutdown-discharge',
    imports: [
        DatePipe,
        PrimeTemplate,
        ReactiveFormsModule,
        TableModule,
        DecimalPipe,
        Button,
        DialogComponent,
        DatePickerComponent,
        InputNumberdComponent,
        TextareaComponent,
        TooltipModule,
        FileUploadComponent,
        FileViewerComponent,
        FileListComponent,
        GroupSelectComponent,
        InputText,
        IconField,
        InputIcon,
        TranslateModule,
        DateWidget
    ],
    templateUrl: './shutdown-discharge.component.html',
    styleUrl: './shutdown-discharge.component.scss'
})
export class ShutdownDischargeComponent implements OnInit, OnChanges, OnDestroy {
    @Input() date: Date | null = null;
    @Output() dateChange = new EventEmitter<Date>();

    selectedDate: Date | null = null;

    discharges: SortableDischarge[] = [];
    loading: boolean = false;
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentDischargeId: number | null = null;

    form!: FormGroup;
    organizations: any[] = [];
    orgsLoading = false;

    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private organizationService: OrganizationService = inject(OrganizationService);
    private dischargeService: DischargeService = inject(DischargeService);
    private gesReportService: GesReportService = inject(GesReportService);
    private apiService: ApiService = inject(ApiService);
    private scService: ScService = inject(ScService);
    private messageService: MessageService = inject(MessageService);
    private translate: TranslateService = inject(TranslateService);
    private destroy$ = new Subject<void>();

    // File handling
    selectedFiles: File[] = [];
    currentDischarge: IdleDischargeResponse | null = null;
    showFilesDialog: boolean = false;
    selectedDischargeForFiles: IdleDischargeResponse | null = null;
    existingFilesToKeep: number[] = [];
    filesDirty = false;

    // Export
    isExcelLoading = false;
    isPdfLoading = false;

    get dateYMD(): string {
        const date = this.selectedDate || new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    ngOnInit(): void {
        this.selectedDate = this.date || new Date();

        this.form = this.fb.group(
            {
                organization: this.fb.control<Organization | null>(null, [Validators.required]),
                started_at: this.fb.control<Date | null>(null, [Validators.required]),
                ended_at: this.fb.control<Date | null>(null),
                flow_rate: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
                reason: this.fb.control<string | null>(null)
            },
            {
                validators: [dateRangeValidator()]
            }
        );

        this.loadDischarges();
        this.loadOrganizations();
    }

    onDateChanged(newDate: Date): void {
        this.selectedDate = newDate;
        this.date = newDate;
        this.dateChange.emit(newDate);
        this.loadDischarges();
    }

    loadDischarges() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        forkJoin({
            discharges: this.dischargeService.getFlatDischarges(dateToUse),
            configs: this.gesReportService.getConfigs().pipe(catchError(() => of([] as GesConfigResponse[])))
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: ({ discharges, configs }) => {
                this.discharges = this.sortByConfigOrder(discharges, configs);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.message });
                this.loading = false;
            },
            complete: () => (this.loading = false)
        });
    }

    private sortByConfigOrder(discharges: IdleDischargeResponse[], configs: GesConfigResponse[]): SortableDischarge[] {
        const orderByOrgId = new Map<number, number>();
        for (const cfg of configs) {
            orderByOrgId.set(cfg.organization_id, cfg.sort_order ?? Number.MAX_SAFE_INTEGER);
        }
        return discharges.map(d => ({
            ...d,
            configSortKey: orderByOrgId.get(d.organization.id) ?? Number.MAX_SAFE_INTEGER
        }));
    }

    customSort(event: SortEvent) {
        // PrimeNG в rowGroupMode="subheader" сам кластеризует строки по groupRowsBy
        // (organization.name) алфавитом и игнорирует порядок входного массива.
        // Перехватываем sort: упорядочиваем по configSortKey (ges_config.sort_order),
        // tie-breaker — started_at для нескольких записей одной станции.
        event.data?.sort((a: SortableDischarge, b: SortableDischarge) => {
            if (a.configSortKey !== b.configSortKey) return a.configSortKey - b.configSortKey;
            return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        });
    }

    private loadOrganizations() {
        this.orgsLoading = true;
        this.organizationService.getCascades().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    openNew() {
        this.isEditMode = false;
        this.currentDischargeId = null;
        this.currentDischarge = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        // Re-enable all fields
        this.form.get('organization')?.enable();
        this.form.get('started_at')?.enable();
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentDischargeId = null;
        this.currentDischarge = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        // Re-enable all fields
        this.form.get('organization')?.enable();
        this.form.get('started_at')?.enable();
        this.form.reset();
        this.loadDischarges();
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        const rawValue = this.form.getRawValue();
        const payload: DischargeCreatePayload & DischargeUpdatePayload = {};

        if (rawValue.organization) {
            payload.organization_id = rawValue.organization.id;
        }
        if (rawValue.started_at) {
            payload.started_at = rawValue.started_at.toISOString();
        }
        if (rawValue.ended_at) {
            payload.ended_at = rawValue.ended_at.toISOString();
        }
        if (rawValue.flow_rate) {
            payload.flow_rate = rawValue.flow_rate;
        }
        if (rawValue.reason) {
            payload.reason = rawValue.reason;
        }

        this.isLoading = true;

        const submitWithPayload = (p: typeof payload, force = false) => {
            if (this.isEditMode && this.currentDischargeId) {
                this.dischargeService.editDischarge(this.currentDischargeId, p).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('DISCHARGE.MESSAGES.RECORD_UPDATED') });
                        this.closeDialog();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('DISCHARGE.MESSAGES.SAVE_ERROR'), detail: err.error?.message || this.translate.instant('DISCHARGE.MESSAGES.SAVE_FAILED') });
                        this.isLoading = false;
                    },
                    complete: () => {
                        this.isLoading = false;
                        this.submitted = false;
                    }
                });
            } else {
                this.dischargeService.addDischarge(p, force).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('DISCHARGE.MESSAGES.RECORD_ADDED') });
                        this.closeDialog();
                    },
                    error: (err) => {
                        if (err.status === 409 && !force) {
                            const msg = err.error?.error || this.translate.instant('DISCHARGE.MESSAGES.CONFLICT_EXISTS');
                            if (confirm(msg + '\n' + this.translate.instant('COMMON.FORCE_CONFIRM'))) {
                                submitWithPayload(p, true);
                            } else {
                                this.isLoading = false;
                                this.submitted = false;
                            }
                        } else {
                            this.messageService.add({ severity: 'error', summary: this.translate.instant('DISCHARGE.MESSAGES.SAVE_ERROR'), detail: err.error?.message || this.translate.instant('DISCHARGE.MESSAGES.SAVE_FAILED') });
                            this.isLoading = false;
                        }
                    },
                    complete: () => {
                        this.isLoading = false;
                        this.submitted = false;
                    }
                });
            }
        };

        if (this.selectedFiles.length > 0) {
            this.apiService.uploadFiles(this.selectedFiles, 1).pipe(takeUntil(this.destroy$)).subscribe({
                next: (res) => {
                    payload.file_ids = [...this.existingFilesToKeep, ...res.ids];
                    submitWithPayload(payload);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('DISCHARGE.MESSAGES.SAVE_ERROR'), detail: err.error?.message || this.translate.instant('DISCHARGE.MESSAGES.SAVE_FAILED') });
                    this.isLoading = false;
                }
            });
        } else if (this.filesDirty) {
            payload.file_ids = this.existingFilesToKeep;
            submitWithPayload(payload);
        } else {
            submitWithPayload(payload);
        }
    }

    editDischarge(discharge: IdleDischargeResponse) {
        this.isEditMode = true;
        this.currentDischargeId = discharge.id;
        this.currentDischarge = discharge;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        // Initialize with all existing file IDs
        this.existingFilesToKeep = discharge.files?.map((f) => f.id) || [];

        // Reset form first to clear any previous state
        this.form.reset();

        let organizationToSet: any = null;
        if (discharge.id && this.organizations) {
            for (const cascade of this.organizations) {
                const foundOrg = cascade.items?.find((org: any) => org.id === discharge.organization.id);
                if (foundOrg) {
                    organizationToSet = foundOrg;
                    break;
                }
            }
        }

        this.form.patchValue({
            organization: organizationToSet,
            started_at: new Date(discharge.started_at),
            ended_at: discharge.ended_at ? new Date(discharge.ended_at) : null,
            flow_rate: discharge.flow_rate,
            reason: discharge.reason || ''
        });

        // Disable organization and started_at in edit mode
        this.form.get('organization')?.enable();
        this.form.get('started_at')?.enable();

        this.isFormOpen = true;
    }

    // File handling methods
    onFileSelect(files: File[]) {
        this.selectedFiles = files;
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    removeExistingFile(fileId: number) {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        this.filesDirty = true;
        // Also remove from current discharge's files for UI update
        if (this.currentDischarge?.files) {
            this.currentDischarge.files = this.currentDischarge.files.filter((f) => f.id !== fileId);
        }
    }

    showFiles(discharge: IdleDischargeResponse) {
        this.selectedDischargeForFiles = discharge;
        this.showFilesDialog = true;
    }

    deleteDischarge(discharge: IdleDischargeResponse) {
        if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
            this.dischargeService.deleteDischarge(discharge.id).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('DISCHARGE.MESSAGES.DELETED') });
                    this.loadDischarges();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('DISCHARGE.MESSAGES.DELETE_ERROR'), detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadDischarges();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getAverageFlowRate(organizationName: string): number {
        return this.getTotalVolume(organizationName) / 0.0864;
    }

    getTotalVolume(organizationName: string): number {
        const orgDischarges = this.discharges.filter((d) => d.organization.name === organizationName);
        return orgDischarges.reduce((acc, d) => acc + d.total_volume, 0);
    }

    getOrganizationIndex(organizationName: string): number {
        const uniqueOrgs = [...new Set(this.discharges.map((d) => d.organization.name))];
        return uniqueOrgs.indexOf(organizationName) + 1;
    }

    getRowIndex(discharge: IdleDischargeResponse): string {
        const orgIndex = this.getOrganizationIndex(discharge.organization.name);
        const orgDischarges = this.discharges.filter((d) => d.organization.name === discharge.organization.name);
        const indexInOrg = orgDischarges.findIndex((d) => d.id === discharge.id) + 1;
        return `${orgIndex}.${indexInOrg}`;
    }

    download(format: 'excel' | 'pdf') {
        if (format === 'excel') this.isExcelLoading = true;
        else this.isPdfLoading = true;

        const dateToUse = this.selectedDate || new Date();

        this.scService
            .downloadScReport(dateToUse, format)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.isExcelLoading = false;
                    this.isPdfLoading = false;
                })
            )
            .subscribe({
                next: (response: HttpResponse<Blob>) => {
                    const extension = format === 'excel' ? 'xlsx' : 'pdf';
                    const filename = `Холостые_сбросы_${this.dateYMD}.${extension}`;
                    downloadBlob(response.body!, filename);
                },
                error: (err: any) => {
                    console.error('Ошибка при скачивании:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('DISCHARGE.MESSAGES.DOWNLOAD_FAILED') });
                }
            });
    }
}
