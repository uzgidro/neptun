import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { AddVisitRequest, EditVisitRequest, VisitDto } from '@/core/interfaces/visits';
import { VisitService } from '@/core/services/visit.service';
import { Organization } from '@/core/interfaces/organizations';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { AuthService } from '@/core/services/auth.service';
import { OrganizationService } from '@/core/services/organization.service';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';

@Component({
    selector: 'app-visit',
    imports: [Button, DatePickerComponent, DatePipe, DialogComponent, PrimeTemplate, ReactiveFormsModule, TableModule, TextareaComponent, TooltipModule, InputTextComponent, SelectComponent, FileUploadComponent, FileViewerComponent],
    templateUrl: './visit.component.html',
    styleUrl: './visit.component.scss'
})
export class VisitComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;

    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentVisitId: number | null = null;

    form!: FormGroup;

    organizations: any[] = [];
    visits: VisitDto[] = [];
    loading: boolean = false;
    orgsLoading = false;
    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private organizationService: OrganizationService = inject(OrganizationService);
    private visitService: VisitService = inject(VisitService);
    private messageService: MessageService = inject(MessageService);

    // File handling
    selectedFiles: File[] = [];
    currentVisit: VisitDto | null = null;
    showFilesDialog: boolean = false;
    selectedVisitForFiles: VisitDto | null = null;

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            visit_date: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required]),
            responsible_name: this.fb.control<string | null>(null, [Validators.required])
        });

        this.loadVisits();

        this.orgsLoading = true;
        this.organizationService.getOrganizationsFlat().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadVisits() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.visitService.getVisits(dateToUse).subscribe({
            next: (data) => {
                this.visits = data;
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
        if (rawPayload.visit_date) {
            formData.append('visit_date', rawPayload.visit_date.toISOString());
        }
        if (rawPayload.description) {
            formData.append('description', rawPayload.description);
        }
        if (rawPayload.responsible_name) {
            formData.append('responsible_name', rawPayload.responsible_name);
        }

        // Add files
        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        if (this.isEditMode && this.currentVisitId) {
            this.visitService.editVisit(this.currentVisitId, formData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Визит обновлен' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка обновления визита', detail: err.message });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        } else {
            this.visitService.addVisit(formData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Визит добавлен' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка добавления визита', detail: err.message });
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
        this.currentVisitId = null;
        this.form.reset();
        this.loadVisits();
    }

    openNew() {
        this.isEditMode = false;
        this.currentVisitId = null;
        this.currentVisit = null;
        this.form.reset();
        this.selectedFiles = [];
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editVisit(visit: VisitDto) {
        this.isEditMode = true;
        this.currentVisitId = visit.id;
        this.currentVisit = visit;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];

        let organizationToSet: any = null;
        if (visit.id && this.organizations) {
            const foundOrg = this.organizations.find((org: any) => org.id === visit.organization_id);
            if (foundOrg) {
                organizationToSet = foundOrg;
            }
        }

        this.form.patchValue({
            organization: organizationToSet,
            visit_date: visit.visit_date,
            description: visit.description,
            responsible_name: visit.responsible_name
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

    showFiles(visit: VisitDto) {
        this.selectedVisitForFiles = visit;
        this.showFilesDialog = true;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    deleteVisit(id: number) {
        if (confirm('Вы уверены, что хотите удалить этот визит?')) {
            this.visitService.deleteVisit(id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Визит удален' });
                    this.loadVisits();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления визита', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadVisits();
        }
    }
}
