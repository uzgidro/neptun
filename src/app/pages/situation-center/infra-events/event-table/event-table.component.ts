import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { InfraEventService } from '@/core/services/infra-event.service';
import { ApiService } from '@/core/services/api.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import { InfraEvent, InfraEventCategory, InfraEventCreatePayload, InfraEventUpdatePayload } from '@/core/interfaces/infra-event';
import { Organization } from '@/core/interfaces/organizations';

@Component({
    selector: 'app-event-table',
    standalone: true,
    imports: [
        DatePipe,
        PrimeTemplate,
        ReactiveFormsModule,
        TableModule,
        Button,
        Checkbox,
        TooltipModule,
        InputText,
        IconField,
        InputIcon,
        TranslateModule,
        DialogComponent,
        DatePickerComponent,
        TextareaComponent,
        GroupSelectComponent,
        FileUploadComponent,
        FileViewerComponent,
        FileListComponent,
        SelectComponent
    ],
    templateUrl: './event-table.component.html'
})
export class EventTableComponent implements OnInit, OnChanges, OnDestroy {
    @Input() category!: InfraEventCategory;
    @Input() categories: InfraEventCategory[] = [];
    @Input() date: Date = new Date();

    events: InfraEvent[] = [];
    loading = false;
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentEventId: number | null = null;
    currentEvent: InfraEvent | null = null;

    form!: FormGroup;
    organizations: any[] = [];
    orgsLoading = false;

    // File handling
    selectedFiles: File[] = [];
    existingFilesToKeep: number[] = [];
    filesDirty = false;
    showFilesDialog = false;
    selectedEventForFiles: InfraEvent | null = null;

    authService = inject(AuthService);
    private fb = inject(FormBuilder);
    private infraEventService = inject(InfraEventService);
    private apiService = inject(ApiService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.form = this.fb.group({
            category: this.fb.control<InfraEventCategory | null>(null, [Validators.required]),
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            occurred_at: this.fb.control<Date | null>(null, [Validators.required]),
            restored_at: this.fb.control<Date | null>(null),
            clear_restored_at: this.fb.control<boolean>(false),
            description: this.fb.control<string>('', [Validators.required]),
            remediation: this.fb.control<string>(''),
            notes: this.fb.control<string>('')
        });

        this.loadEvents();
        this.loadOrganizations();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange || changes['category'] && !changes['category'].firstChange) {
            this.loadEvents();
        }
    }

    loadEvents(): void {
        this.loading = true;
        this.infraEventService
            .getEvents(this.date, this.category.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => (this.events = data),
                error: () => (this.loading = false),
                complete: () => (this.loading = false)
            });
    }

    private loadOrganizations(): void {
        this.orgsLoading = true;
        this.organizationService
            .getCascades()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => (this.organizations = data),
                error: () => (this.orgsLoading = false),
                complete: () => (this.orgsLoading = false)
            });
    }

    openNew(): void {
        this.isEditMode = false;
        this.currentEventId = null;
        this.currentEvent = null;
        this.form.reset({ clear_restored_at: false, category: this.category });
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editEvent(event: InfraEvent): void {
        this.isEditMode = true;
        this.currentEventId = event.id;
        this.currentEvent = { ...event, files: [...event.files] };
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        this.existingFilesToKeep = event.files?.map((f) => f.id) || [];
        this.filesDirty = false;

        let organizationToSet: any = null;
        for (const cascade of this.organizations) {
            const foundOrg = cascade.items?.find((org: any) => org.id === event.organization_id);
            if (foundOrg) {
                organizationToSet = foundOrg;
                break;
            }
        }

        const categoryToSet = this.categories.find((c) => c.id === event.category_id) || this.category;

        this.form.reset({ clear_restored_at: false });
        this.form.patchValue({
            category: categoryToSet,
            organization: organizationToSet,
            occurred_at: new Date(event.occurred_at),
            restored_at: event.restored_at ? new Date(event.restored_at) : null,
            description: event.description,
            remediation: event.remediation || '',
            notes: event.notes || ''
        });

        this.isFormOpen = true;
    }

    closeDialog(): void {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentEventId = null;
        this.currentEvent = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        this.form.reset({ clear_restored_at: false });
        this.loadEvents();
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        this.isLoading = true;
        const raw = this.form.getRawValue();

        if (this.selectedFiles.length > 0) {
            const dateStr = this.date.toISOString().split('T')[0];
            const uploads$ = this.selectedFiles.map((file) => this.apiService.uploadFile(file, 1, dateStr));
            forkJoin(uploads$)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (results: any[]) => {
                        const newFileIds = results.map((r) => r.id);
                        this.submitPayload(raw, [...this.existingFilesToKeep, ...newFileIds]);
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR') });
                        this.isLoading = false;
                    }
                });
        } else {
            const fileIds = this.isEditMode && this.filesDirty ? this.existingFilesToKeep : undefined;
            this.submitPayload(raw, fileIds);
        }
    }

    private submitPayload(raw: any, fileIds?: number[]): void {
        if (this.isEditMode && this.currentEventId) {
            const payload: InfraEventUpdatePayload = {};
            if (raw.category) payload.category_id = raw.category.id;
            if (raw.organization) payload.organization_id = raw.organization.id;
            if (raw.occurred_at) payload.occurred_at = raw.occurred_at.toISOString();
            if (raw.clear_restored_at) {
                payload.clear_restored_at = true;
            } else if (raw.restored_at) {
                payload.restored_at = raw.restored_at.toISOString();
            }
            if (raw.description) payload.description = raw.description;
            if (raw.remediation !== undefined) payload.remediation = raw.remediation;
            if (raw.notes !== undefined) payload.notes = raw.notes;
            if (fileIds !== undefined) payload.file_ids = fileIds;

            this.infraEventService
                .updateEvent(this.currentEventId, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.EVENT_UPDATED') });
                        this.closeDialog();
                    },
                    error: () => (this.isLoading = false)
                });
        } else {
            const payload: InfraEventCreatePayload = {
                category_id: raw.category.id,
                organization_id: raw.organization.id,
                occurred_at: raw.occurred_at.toISOString(),
                description: raw.description
            };
            if (raw.restored_at) payload.restored_at = raw.restored_at.toISOString();
            if (raw.remediation) payload.remediation = raw.remediation;
            if (raw.notes) payload.notes = raw.notes;
            if (fileIds && fileIds.length > 0) payload.file_ids = fileIds;

            this.infraEventService
                .createEvent(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.EVENT_CREATED') });
                        this.closeDialog();
                    },
                    error: () => (this.isLoading = false)
                });
        }
    }

    deleteEvent(event: InfraEvent): void {
        if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
            this.infraEventService
                .deleteEvent(event.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.EVENT_DELETED') });
                        this.loadEvents();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.error?.error });
                    }
                });
        }
    }

    // File handling
    onFileSelect(files: File[]): void {
        this.selectedFiles = files;
        this.filesDirty = true;
    }

    removeFile(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.filesDirty = true;
    }

    removeExistingFile(fileId: number): void {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        this.filesDirty = true;
        if (this.currentEvent?.files) {
            this.currentEvent.files = this.currentEvent.files.filter((f) => f.id !== fileId);
        }
    }

    getRowIndex(event: InfraEvent): string {
        const uniqueOrgs = [...new Set(this.events.map((e) => e.organization_name))];
        const orgIndex = uniqueOrgs.indexOf(event.organization_name) + 1;
        const orgEvents = this.events.filter((e) => e.organization_name === event.organization_name);
        const indexInOrg = orgEvents.findIndex((e) => e.id === event.id) + 1;
        return `${orgIndex}.${indexInOrg}`;
    }

    showFiles(event: InfraEvent): void {
        this.selectedEventForFiles = event;
        this.showFilesDialog = true;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
