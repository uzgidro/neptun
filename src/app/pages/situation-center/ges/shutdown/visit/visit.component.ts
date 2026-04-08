import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { VisitCreatePayload, VisitDto, VisitUpdatePayload } from '@/core/interfaces/visits';
import { VisitService } from '@/core/services/visit.service';
import { ApiService } from '@/core/services/api.service';
import { Organization } from '@/core/interfaces/organizations';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { AuthService } from '@/core/services/auth.service';
import { OrganizationService } from '@/core/services/organization.service';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScService } from '@/core/services/sc.service';
import { HttpResponse } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { downloadBlob } from '@/core/utils/download';

@Component({
    selector: 'app-visit',
    imports: [
        Button,
        DatePickerComponent,
        DatePipe,
        DialogComponent,
        PrimeTemplate,
        ReactiveFormsModule,
        TableModule,
        TextareaComponent,
        TooltipModule,
        InputTextComponent,
        SelectComponent,
        FileUploadComponent,
        FileViewerComponent,
        FileListComponent,
        TranslateModule
    ],
    templateUrl: './visit.component.html',
    styleUrl: './visit.component.scss'
})
export class VisitComponent implements OnInit, OnChanges, OnDestroy {
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
    private apiService: ApiService = inject(ApiService);
    private scService: ScService = inject(ScService);
    private messageService: MessageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    // Export
    isExcelLoading = false;
    isPdfLoading = false;

    // File handling
    selectedFiles: File[] = [];
    currentVisit: VisitDto | null = null;
    showFilesDialog: boolean = false;
    selectedVisitForFiles: VisitDto | null = null;
    existingFilesToKeep: number[] = [];
    filesDirty = false;

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            visit_date: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required]),
            responsible_name: this.fb.control<string | null>(null, [Validators.required])
        });

        this.loadVisits();

        this.orgsLoading = true;
        this.organizationService.getOrganizationsFlat().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadVisits() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.visitService.getVisits(dateToUse).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.visits = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.message });
                this.loading = false;
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
        const payload: VisitCreatePayload & VisitUpdatePayload = {} as any;

        if (rawPayload.organization) {
            payload.organization_id = rawPayload.organization.id;
        }
        if (rawPayload.visit_date) {
            payload.visit_date = rawPayload.visit_date.toISOString();
        }
        if (rawPayload.description) {
            payload.description = rawPayload.description;
        }
        if (rawPayload.responsible_name) {
            payload.responsible_name = rawPayload.responsible_name;
        }

        const submitWithPayload = (p: typeof payload) => {
            if (this.isEditMode && this.currentVisitId) {
                this.visitService.editVisit(this.currentVisitId, p).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.VISIT.UPDATED') });
                        this.closeDialog();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('SITUATION_CENTER.VISIT.UPDATE_ERROR'), detail: err.message });
                        this.isLoading = false;
                    },
                    complete: () => {
                        this.isLoading = false;
                        this.submitted = false;
                    }
                });
            } else {
                this.visitService.addVisit(p).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.VISIT.CREATED') });
                        this.closeDialog();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('SITUATION_CENTER.VISIT.CREATE_ERROR'), detail: err.message });
                        this.isLoading = false;
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
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('SITUATION_CENTER.VISIT.CREATE_ERROR'), detail: err.error?.message || this.translate.instant('SITUATION_CENTER.VISIT.CREATE_ERROR') });
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

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentVisitId = null;
        this.currentVisit = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        this.form.reset();
        this.loadVisits();
    }

    openNew() {
        this.isEditMode = false;
        this.currentVisitId = null;
        this.currentVisit = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
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
        // Initialize with all existing file IDs
        this.existingFilesToKeep = visit.files?.map((f) => f.id) || [];

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

    removeExistingFile(fileId: number) {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        this.filesDirty = true;
        // Also remove from current visit's files for UI update
        if (this.currentVisit?.files) {
            this.currentVisit.files = this.currentVisit.files.filter((f) => f.id !== fileId);
        }
    }

    showFiles(visit: VisitDto) {
        this.selectedVisitForFiles = visit;
        this.showFilesDialog = true;
    }

    deleteVisit(id: number) {
        if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
            this.visitService.deleteVisit(id).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.VISIT.DELETED') });
                    this.loadVisits();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('SITUATION_CENTER.VISIT.DELETE_ERROR'), detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadVisits();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get dateYMD(): string {
        const date = this.date || new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    download(format: 'excel' | 'pdf') {
        if (format === 'excel') this.isExcelLoading = true;
        else this.isPdfLoading = true;

        const dateToUse = this.date || new Date();

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
                    const filename = `sc_${this.dateYMD}.${extension}`;
                    downloadBlob(response.body!, filename);
                },
                error: (err: any) => {
                    console.error('Ошибка при скачивании:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('COMMON.DOWNLOAD_ERROR') });
                }
            });
    }
}
