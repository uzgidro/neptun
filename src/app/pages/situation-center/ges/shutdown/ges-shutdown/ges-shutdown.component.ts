import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
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
import { ApiService } from '@/core/services/api.service';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { GesShutdownDto, ShutdownCreatePayload, ShutdownDto, ShutdownUpdatePayload } from '@/core/interfaces/ges-shutdown';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '@/core/services/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { OrganizationService } from '@/core/services/organization.service';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScService } from '@/core/services/sc.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { downloadBlob } from '@/core/utils/download';

@Component({
    selector: 'app-ges-shutdown',
    imports: [
        Button,
        DatePickerComponent,
        DialogComponent,
        GroupSelectComponent,
        PrimeTemplate,
        ReactiveFormsModule,
        TableModule,
        TextareaComponent,
        InputNumberdComponent,
        DatePipe,
        TooltipModule,
        DecimalPipe,
        FileUploadComponent,
        FileViewerComponent,
        FileListComponent,
        TranslateModule
    ],
    templateUrl: './ges-shutdown.component.html',
    styleUrl: './ges-shutdown.component.scss'
})
export class GesShutdownComponent implements OnInit, OnChanges, OnDestroy {
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
    currentShutdown: ShutdownDto | null = null;
    showFilesDialog: boolean = false;
    selectedShutdownForFiles: ShutdownDto | null = null;
    existingFilesToKeep: number[] = [];
    filesDirty = false;

    /**
     * UX gate: кому показывать кнопки Create/Edit/Delete АО.
     * Source of truth — бэкенд (ACL через claims.OrganizationID + cascadefilter).
     * Если cascade через DevTools обойдёт этот флаг, бэк всё равно ответит 403/404.
     */
    get canWriteShutdown(): boolean {
        return this.authService.hasRole(['sc', 'rais', 'cascade']);
    }

    /**
     * Унифицированный обработчик ошибок shutdown-запросов.
     * Важно: 403 и 404 используют одинаково generic тексты, чтобы не
     * раскрыть cascade различие «чужая запись vs её не существует»
     * (IDOR enumeration защита — см. docs/plans/.../Security §2).
     */
    private handleShutdownError(err: HttpErrorResponse, fallbackSummaryKey: string): void {
        if (err.status === 403) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('SITUATION_CENTER.SHUTDOWN.ERROR_FORBIDDEN')
            });
        } else if (err.status === 404) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('SITUATION_CENTER.SHUTDOWN.ERROR_NOT_FOUND')
            });
            this.loadShutdowns();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant(fallbackSummaryKey),
                detail: err.error?.message || this.translate.instant(fallbackSummaryKey)
            });
        }
    }

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
        this.organizationService.getCascades().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadShutdowns() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.gesShutdownService.getShutdowns(dateToUse).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.shutdowns = data;
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
        const payload: ShutdownCreatePayload & ShutdownUpdatePayload = {};

        if (rawPayload.organization) {
            payload.organization_id = rawPayload.organization.id;
        }
        if (rawPayload.start_time) {
            payload.start_time = rawPayload.start_time.toISOString();
        }
        if (rawPayload.end_time) {
            payload.end_time = rawPayload.end_time.toISOString();
        }
        if (rawPayload.reason) {
            payload.reason = rawPayload.reason;
        }
        if (rawPayload.generation_loss) {
            payload.generation_loss = rawPayload.generation_loss;
        }
        if (rawPayload.idle_discharge_volume) {
            payload.idle_discharge_volume = rawPayload.idle_discharge_volume;
        }

        const submitWithPayload = (p: typeof payload, force = false) => {
            if (this.isEditMode && this.currentShutdownId) {
                this.gesShutdownService.editShutdown(this.currentShutdownId, p).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.SHUTDOWN.EVENT_UPDATED') });
                        this.closeDialog();
                        this.shutdownSaved.emit();
                    },
                    error: (err: HttpErrorResponse) => {
                        this.handleShutdownError(err, 'SITUATION_CENTER.SHUTDOWN.EVENT_UPDATE_ERROR');
                        this.isLoading = false;
                    },
                    complete: () => {
                        this.isLoading = false;
                        this.submitted = false;
                    }
                });
            } else {
                this.gesShutdownService.addShutdown(p, force).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.isFormOpen = false;
                        this.form.reset();
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.SHUTDOWN.EVENT_CREATED') });
                        this.closeDialog();
                        this.shutdownSaved.emit();
                    },
                    error: (err: HttpErrorResponse) => {
                        if (err.status === 409 && !force) {
                            const msg = err.error?.error || this.translate.instant('SITUATION_CENTER.SHUTDOWN.CONFLICT_EXISTS');
                            if (confirm(msg + '\n' + this.translate.instant('COMMON.FORCE_CONFIRM'))) {
                                submitWithPayload(p, true);
                            } else {
                                this.isLoading = false;
                                this.submitted = false;
                            }
                        } else {
                            this.handleShutdownError(err, 'SITUATION_CENTER.SHUTDOWN.EVENT_CREATE_ERROR');
                            this.isLoading = false;
                        }
                    },
                    complete: () => {
                        this.submitted = false;
                        this.isLoading = false;
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
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('SITUATION_CENTER.SHUTDOWN.EVENT_CREATE_ERROR'), detail: err.error?.message || this.translate.instant('SITUATION_CENTER.SHUTDOWN.EVENT_CREATE_ERROR') });
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
        this.currentShutdownId = null;
        this.currentShutdown = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
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
        this.filesDirty = false;
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
        this.existingFilesToKeep = shutdown.files?.map((f) => f.id) || [];

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
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        this.filesDirty = true;
        // Also remove from current shutdown's files for UI update
        if (this.currentShutdown?.files) {
            this.currentShutdown.files = this.currentShutdown.files.filter((f) => f.id !== fileId);
        }
    }

    showFiles(shutdown: ShutdownDto) {
        this.selectedShutdownForFiles = shutdown;
        this.showFilesDialog = true;
    }

    deleteShutdown(id: number) {
        if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
            this.gesShutdownService.deleteShutdown(id).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.SHUTDOWN.EVENT_DELETED') });
                    this.loadShutdowns();
                    this.shutdownSaved.emit();
                },
                error: (err: HttpErrorResponse) => {
                    this.handleShutdownError(err, 'SITUATION_CENTER.SHUTDOWN.EVENT_DELETE_ERROR');
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadShutdowns();
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
