import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Organization } from '@/core/interfaces/organizations';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { GesShutdownDto, GesShutdownPayload, ShutdownDto } from '@/core/interfaces/ges-shutdown';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '@/core/services/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { OrganizationService } from '@/core/services/organization.service';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';

@Component({
    selector: 'app-ges-shutdown',
    imports: [Button, DatePickerComponent, DialogComponent, GroupSelectComponent, PrimeTemplate, ReactiveFormsModule, TableModule, TextareaComponent, InputNumberdComponent, DatePipe, TooltipModule, DecimalPipe, FileUploadComponent, FileViewerComponent],
    templateUrl: './ges-shutdown.component.html',
    styleUrl: './ges-shutdown.component.scss'
})
export class GesShutdownComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;
    @Output() shutdownSaved = new EventEmitter<void>();

    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentShutdownId: number | null = null;

    form!: FormGroup;

    organizations: any[] = [];
    shutdowns: GesShutdownDto = { ges: [], mini: [], micro: [] };
    loading: boolean = false;
    orgsLoading = false;
    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private organizationService: OrganizationService = inject(OrganizationService);
    private gesShutdownService: GesShutdownService = inject(GesShutdownService);
    private messageService: MessageService = inject(MessageService);

    // File handling
    selectedFiles: File[] = [];
    currentShutdown: ShutdownDto | null = null;
    showFilesDialog: boolean = false;
    selectedShutdownForFiles: ShutdownDto | null = null;
    existingFilesToKeep: number[] = [];

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            start_time: this.fb.control<Date | null>(null, [Validators.required]),
            end_time: this.fb.control<Date | null>(null),
            reason: this.fb.control<string | null>(null),
            generation_loss: this.fb.control<number | null>(null),
            idle_discharge_volume: this.fb.control<number | null>(null)
        });

        this.loadShutdowns();

        this.orgsLoading = true;
        this.organizationService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadShutdowns() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.gesShutdownService.getShutdowns(dateToUse).subscribe({
            next: (data) => {
                this.shutdowns = data;
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
        if (rawPayload.start_time) {
            formData.append('start_time', rawPayload.start_time.toISOString());
        }
        if (rawPayload.end_time) {
            formData.append('end_time', rawPayload.end_time.toISOString());
        }
        if (rawPayload.reason) {
            formData.append('reason', rawPayload.reason);
        }
        if (rawPayload.generation_loss) {
            formData.append('generation_loss', rawPayload.generation_loss.toString());
        }
        if (rawPayload.idle_discharge_volume) {
            formData.append('idle_discharge_volume', rawPayload.idle_discharge_volume.toString());
        }

        // Add new files
        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        // Add existing file IDs to keep (in edit mode)
        if (this.isEditMode) {
            formData.append('file_ids', this.existingFilesToKeep.join(','));
        }

        if (this.isEditMode && this.currentShutdownId) {
            this.gesShutdownService.editShutdown(this.currentShutdownId, formData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Событие обновлено' });
                    this.closeDialog();
                    this.shutdownSaved.emit();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка обновления события', detail: err.message });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        } else {
            this.gesShutdownService.addShutdown(formData).subscribe({
                next: () => {
                    this.isFormOpen = false;
                    this.form.reset();
                    this.messageService.add({ severity: 'success', summary: 'Событие добавлено' });
                    this.closeDialog();
                    this.shutdownSaved.emit();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка добавления события', detail: err.message });
                    this.isLoading = false;
                },
                complete: () => {
                    this.submitted = false;
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
        this.currentShutdownId = null;
        this.currentShutdown = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.form.reset();
        this.loadShutdowns();
    }

    openNew() {
        this.isEditMode = false;
        this.currentShutdownId = null;
        this.currentShutdown = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editShutdown(shutdown: ShutdownDto) {
        this.isEditMode = true;
        this.currentShutdownId = shutdown.id;
        this.currentShutdown = shutdown;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        // Initialize with all existing file IDs
        this.existingFilesToKeep = shutdown.files?.map(f => f.id) || [];

        let organizationToSet: any = null;
        if (shutdown.organization_id && this.organizations) {
            for (const cascade of this.organizations) {
                const foundOrg = cascade.items?.find((org: any) => org.id === shutdown.organization_id);
                if (foundOrg) {
                    organizationToSet = foundOrg;
                    break;
                }
            }
        }

        this.form.patchValue({
            organization: organizationToSet,
            start_time: shutdown.started_at,
            end_time: shutdown.ended_at,
            reason: shutdown.reason,
            generation_loss: shutdown.generation_loss,
            idle_discharge_volume: shutdown.idle_discharge_volume
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

    removeExistingFile(fileId: number) {
        this.existingFilesToKeep = this.existingFilesToKeep.filter(id => id !== fileId);
        // Also remove from current shutdown's files for UI update
        if (this.currentShutdown?.files) {
            this.currentShutdown.files = this.currentShutdown.files.filter(f => f.id !== fileId);
        }
    }

    showFiles(shutdown: ShutdownDto) {
        this.selectedShutdownForFiles = shutdown;
        this.showFilesDialog = true;
    }

    formatFileSize(bytes: number): string {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    deleteShutdown(id: number) {
        if (confirm('Вы уверены, что хотите удалить это событие?')) {
            this.gesShutdownService.deleteShutdown(id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Событие удалено' });
                    this.loadShutdowns();
                    this.shutdownSaved.emit();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления события', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadShutdowns();
        }
    }
}
