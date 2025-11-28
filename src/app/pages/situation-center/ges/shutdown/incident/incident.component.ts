import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { IncidentDto } from '@/core/interfaces/incidents';
import { IncidentService } from '@/core/services/incident.service';
import { Organization } from '@/core/interfaces/organizations';
import { AuthService } from '@/core/services/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { OrganizationService } from '@/core/services/organization.service';
import { Checkbox } from 'primeng/checkbox';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';

@Component({
    selector: 'app-incident',
    imports: [Button, DatePickerComponent, DatePipe, DialogComponent, PrimeTemplate, ReactiveFormsModule, TableModule, TextareaComponent, TooltipModule, Checkbox, SelectComponent, FileUploadComponent, FileViewerComponent],
    templateUrl: './incident.component.html',
    styleUrl: './incident.component.scss'
})
export class IncidentComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;
    @Output() incidentSaved = new EventEmitter<void>();

    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentIncidentId: number | null = null;

    form!: FormGroup;

    organizations: any[] = [];
    incidents: IncidentDto[] = [];
    loading: boolean = false;
    orgsLoading = false;
    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private organizationService: OrganizationService = inject(OrganizationService);
    private incidentService: IncidentService = inject(IncidentService);
    private messageService: MessageService = inject(MessageService);

    // File handling
    selectedFiles: File[] = [];
    currentIncident: IncidentDto | null = null;
    showFilesDialog: boolean = false;
    selectedIncidentForFiles: IncidentDto | null = null;

    ngOnInit(): void {
        this.form = this.fb.group({
            applies_to_all: this.fb.control<boolean>(false),
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            incident_time: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required])
        });

        // Watch for changes to applies_to_all checkbox
        this.form.get('applies_to_all')?.valueChanges.subscribe((appliesToAll) => {
            const organizationControl = this.form.get('organization');
            if (appliesToAll) {
                organizationControl?.clearValidators();
                organizationControl?.setValue(null);
                organizationControl?.disable();
            } else {
                organizationControl?.setValidators([Validators.required]);
                organizationControl?.enable();
            }
            organizationControl?.updateValueAndValidity();
        });

        this.loadIncidents();

        this.orgsLoading = true;
        this.organizationService.getOrganizationsFlat().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadIncidents() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.incidentService.getIncidents(dateToUse).subscribe({
            next: (data) => {
                this.incidents = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.loading = false)
        });
    }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;
        const rawPayload = this.form.getRawValue();
        const formData = new FormData();

        if (rawPayload.organization) {
            formData.append('organization_id', rawPayload.organization.id.toString());
        }
        if (rawPayload.incident_time) {
            formData.append('incident_time', rawPayload.incident_time.toISOString());
        }
        if (rawPayload.description) {
            formData.append('description', rawPayload.description);
        }

        // Add files
        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        if (this.isEditMode && this.currentIncidentId) {
            this.incidentService.editIncident(this.currentIncidentId, formData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Инцидент обновлен' });
                    this.incidentSaved.emit();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка обновления инцидента', detail: err.message });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        } else {
            this.incidentService.addIncident(formData).subscribe({
                next: () => {
                    this.isFormOpen = false;
                    this.form.reset();
                    this.messageService.add({ severity: 'success', summary: 'Инцидент добавлен' });
                    this.incidentSaved.emit();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка добавления инцидента', detail: err.message });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        }
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentIncidentId = null;
        this.form.reset();
        this.loadIncidents();
    }

    openNew() {
        this.isEditMode = false;
        this.currentIncidentId = null;
        this.currentIncident = null;
        this.form.reset();
        this.selectedFiles = [];
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editIncident(incident: IncidentDto) {
        this.isEditMode = true;
        this.currentIncidentId = incident.id;
        this.currentIncident = incident;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];

        let organizationToSet: any = null;
        const appliesToAll = !incident.id;

        if (incident.id && this.organizations) {
            const foundOrg = this.organizations.find((org: any) => org.id === incident.organization_id);
            if (foundOrg) {
                organizationToSet = foundOrg;
            }
        }

        this.form.patchValue({
            applies_to_all: appliesToAll,
            organization: organizationToSet,
            incident_time: incident.incident_date,
            description: incident.description
        });

        this.isFormOpen = true;
    }

    // File handling methods
    onFileSelect(files: File[]) {
        this.selectedFiles = files;
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    showFiles(incident: IncidentDto) {
        this.selectedIncidentForFiles = incident;
        this.showFilesDialog = true;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    deleteIncident(incident: IncidentDto) {
        if (confirm('Вы уверены, что хотите удалить этот инцидент?')) {
            this.incidentService.deleteIncident(incident.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Инцидент удален' });
                    this.loadIncidents();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления инцидента', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadIncidents();
        }
    }
}
