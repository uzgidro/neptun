import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DischargeService } from '@/core/services/discharge.service';
import { IdleDischargeResponse } from '@/core/interfaces/discharge';
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
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslateModule } from '@ngx-translate/core';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { finalize } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { ScService } from '@/core/services/sc.service';

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
        SelectComponent,
        InputText,
        IconField,
        InputIcon,
        SelectComponent,
        TranslateModule,
        DateWidget
    ],
    templateUrl: './shutdown-discharge.component.html',
    styleUrl: './shutdown-discharge.component.scss'
})
export class ShutdownDischargeComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;
    @Output() dateChange = new EventEmitter<Date>();

    selectedDate: Date | null = null;

    discharges: IdleDischargeResponse[] = [];
    loading: boolean = false;
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentDischargeId: number | null = null;

    form!: FormGroup;
    organizations: Organization[] = [];
    orgsLoading = false;

    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private organizationService: OrganizationService = inject(OrganizationService);
    private dischargeService: DischargeService = inject(DischargeService);
    private scService: ScService = inject(ScService);
    private messageService: MessageService = inject(MessageService);

    // File handling
    selectedFiles: File[] = [];
    currentDischarge: IdleDischargeResponse | null = null;
    showFilesDialog: boolean = false;
    selectedDischargeForFiles: IdleDischargeResponse | null = null;
    existingFilesToKeep: number[] = [];

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
        this.dischargeService.getFlatDischarges(dateToUse).subscribe({
            next: (data) => {
                this.discharges = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.loading = false)
        });
    }

    private loadOrganizations() {
        this.orgsLoading = true;
        this.organizationService.getOrganizationsFlat().subscribe({
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
        const formData = new FormData();

        if (rawValue.organization) {
            formData.append('organization_id', rawValue.organization.id.toString());
        }
        if (rawValue.started_at) {
            formData.append('started_at', rawValue.started_at.toISOString());
        }
        if (rawValue.ended_at) {
            formData.append('ended_at', rawValue.ended_at.toISOString());
        }
        if (rawValue.flow_rate) {
            formData.append('flow_rate', rawValue.flow_rate.toString());
        }
        if (rawValue.reason) {
            formData.append('reason', rawValue.reason);
        }

        // Add new files
        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        // Add existing file IDs to keep (in edit mode)
        if (this.isEditMode) {
            formData.append('file_ids', this.existingFilesToKeep.join(','));
        }

        this.isLoading = true;

        if (this.isEditMode && this.currentDischargeId) {
            this.dischargeService.editDischarge(this.currentDischargeId, formData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Запись о списании обновлена' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка сохранения', detail: err.error?.message || 'Не удалось сохранить данные' });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        } else {
            this.dischargeService.addDischarge(formData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Новая запись о списании добавлена' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка сохранения', detail: err.error?.message || 'Не удалось сохранить данные' });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
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
            const foundOrg = this.organizations.find((org: any) => org.id === discharge.organization.id);
            if (foundOrg) {
                organizationToSet = foundOrg;
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
        if (confirm('Вы уверены, что хотите удалить это списание?')) {
            this.dischargeService.deleteDischarge(discharge.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Списание удалено' });
                    this.loadDischarges();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления списания', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadDischarges();
        }
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
                finalize(() => {
                    this.isExcelLoading = false;
                    this.isPdfLoading = false;
                })
            )
            .subscribe({
                next: (response: HttpResponse<Blob>) => {
                    const extension = format === 'excel' ? 'xlsx' : 'pdf';
                    const filename = `Списания_продукции_${this.dateYMD}.${extension}`;
                    saveAs(response.body!, filename);
                },
                error: (err: any) => {
                    console.error('Ошибка при скачивании:', err);
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось скачать файл' });
                }
            });
    }
}
