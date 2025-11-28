import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DischargeService } from '@/core/services/discharge.service';
import { IdleDischargeResponse, WaterDischargePayload } from '@/core/interfaces/discharge';
import { Button } from 'primeng/button';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
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

@Component({
    selector: 'app-shutdown-discharge',
    imports: [DatePipe, PrimeTemplate, ReactiveFormsModule, TableModule, DecimalPipe, Button, DialogComponent, GroupSelectComponent, DatePickerComponent, InputNumberdComponent, TextareaComponent, TooltipModule, FileUploadComponent, FileViewerComponent],
    templateUrl: './shutdown-discharge.component.html',
    styleUrl: './shutdown-discharge.component.scss'
})
export class ShutdownDischargeComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;

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
    private messageService: MessageService = inject(MessageService);

    // File handling
    selectedFiles: File[] = [];
    currentDischarge: IdleDischargeResponse | null = null;
    showFilesDialog: boolean = false;
    selectedDischargeForFiles: IdleDischargeResponse | null = null;
    existingFilesToKeep: number[] = [];

    ngOnInit(): void {
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
        this.organizationService.getCascades().subscribe({
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
                    this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Запись о водосбросе обновлена' });
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
                    this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Новая запись о водосбросе добавлена' });
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
        this.existingFilesToKeep = discharge.files?.map(f => f.id) || [];

        // Reset form first to clear any previous state
        this.form.reset();

        let organizationToSet: any = null;
        if (discharge.organization && this.organizations) {
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
        this.existingFilesToKeep = this.existingFilesToKeep.filter(id => id !== fileId);
        // Also remove from current discharge's files for UI update
        if (this.currentDischarge?.files) {
            this.currentDischarge.files = this.currentDischarge.files.filter(f => f.id !== fileId);
        }
    }

    showFiles(discharge: IdleDischargeResponse) {
        this.selectedDischargeForFiles = discharge;
        this.showFilesDialog = true;
    }

    formatFileSize(bytes: number): string {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    deleteDischarge(discharge: IdleDischargeResponse) {
        if (confirm('Вы уверены, что хотите удалить этот водосброс?')) {
            this.dischargeService.deleteDischarge(discharge.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Водосброс удален' });
                    this.loadDischarges();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления водосброса', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadDischarges();
        }
    }
}
