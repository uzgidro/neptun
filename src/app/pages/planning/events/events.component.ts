import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject, switchMap, takeUntil } from 'rxjs';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Custom Dialog Components
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';

// Services
import { EventManagementService } from '@/core/services/event-management.service';
import { ContactService } from '@/core/services/contact.service';
import { OrganizationService } from '@/core/services/organization.service';
import { MessageService } from 'primeng/api';

// Interfaces
import { Event, EventCreatePayload, EventFilters, EventStatus, EventType, EventUpdatePayload } from '@/core/interfaces/event-management';
import { ApiService } from '@/core/services/api.service';
import { Contact } from '@/core/interfaces/contact';
import { Organization } from '@/core/interfaces/organizations';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        TagModule,
        ToastModule,
        AutoCompleteModule,
        TranslateModule,
        DialogComponent,
        InputTextComponent,
        TextareaComponent,
        DatePickerComponent,
        SelectComponent,
        FileUploadComponent,
        FileListComponent,
        FileViewerComponent,
        Tooltip
    ],
    providers: [MessageService],
    templateUrl: './events.component.html',
    styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit, OnDestroy {
    // Services
    private eventService = inject(EventManagementService);
    private apiService = inject(ApiService);
    private contactService = inject(ContactService);
    private organizationService = inject(OrganizationService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    // State
    events = signal<Event[]>([]);
    loading = signal(true);
    displayDialog = signal(false);
    isEditMode = signal(false);
    selectedEvent: Event | null = null;
    submitted = false;

    // Reference data
    eventTypes: EventType[] = [];
    eventStatuses: EventStatus[] = [];
    organizations: Organization[] = [];

    // Contact autocomplete
    filteredContacts: Contact[] = [];
    showCreateContact = false;

    // Files
    selectedFiles: File[] = [];
    existingFilesToKeep: number[] = [];

    // File viewer
    showFilesDialog = false;
    selectedEventForFiles: Event | null = null;

    // Form
    eventForm: FormGroup;

    // Filters
    filterForm: FormGroup;

    constructor() {
        // Initialize event form
        this.eventForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            location: [''],
            event_date: [null, Validators.required],
            event_type_id: [null, Validators.required],
            event_status_id: [null],
            organization_id: [null],

            // Contact section
            responsible_contact: [null],
            use_existing_contact: [true],
            responsible_fio: [''],
            responsible_phone: ['']
        });

        // Initialize filter form
        this.filterForm = this.fb.group({
            statusId: [null],
            typeId: [null],
            organizationId: [null],
            dateFrom: [null],
            dateTo: [null]
        });
    }

    ngOnInit() {
        this.loadReferenceData();
        this.loadEvents();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Load reference data (types, statuses, organizations)
     */
    loadReferenceData() {
        forkJoin({
            types: this.eventService.getEventTypes(),
            statuses: this.eventService.getEventStatuses(),
            organizations: this.organizationService.getOrganizationsFlat()
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.eventTypes = data.types;
                    this.eventStatuses = data.statuses;
                    this.organizations = data.organizations;
                },
                error: (error) => {
                    console.error('Failed to load reference data:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('PLANNING.COMMON.ERROR'),
                        detail: this.translate.instant('PLANNING.EVENTS.LOAD_REF_ERROR')
                    });
                }
            });
    }

    /**
     * Load events with optional filters
     */
    loadEvents() {
        this.loading.set(true);
        const filters = this.buildFilters();

        this.eventService
            .getEvents(filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.events.set(data);
                    this.loading.set(false);
                },
                error: (error) => {
                    console.error('Failed to load events:', error);
                    this.loading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('PLANNING.COMMON.ERROR'),
                        detail: this.translate.instant('PLANNING.EVENTS.LOAD_ERROR')
                    });
                }
            });
    }

    /**
     * Build filters from filter form
     */
    buildFilters(): EventFilters | undefined {
        const formValue = this.filterForm.value;
        const filters: EventFilters = {};

        if (formValue.statusId) filters.statusId = formValue.statusId.id;
        if (formValue.typeId) filters.typeId = formValue.typeId.id;
        if (formValue.organizationId) filters.organizationId = formValue.organizationId.id;
        if (formValue.dateFrom) filters.dateFrom = formValue.dateFrom.toISOString();
        if (formValue.dateTo) filters.dateTo = formValue.dateTo.toISOString();

        return Object.keys(filters).length > 0 ? filters : undefined;
    }

    /**
     * Open dialog to create new event
     */
    openCreateDialog() {
        this.isEditMode.set(false);
        this.selectedEvent = null;
        this.eventForm.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.showCreateContact = false;
        this.submitted = false;
        this.displayDialog.set(true);
    }

    /**
     * Close dialog
     */
    closeDialog() {
        this.displayDialog.set(false);
        this.submitted = false;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
    }

    /**
     * Open dialog to edit existing event
     */
    openEditDialog(event: Event) {
        this.isEditMode.set(true);
        this.selectedEvent = event;
        this.submitted = false;

        // Populate form with existing data
        this.eventForm.patchValue({
            name: event.name,
            description: event.description,
            location: event.location,
            event_date: new Date(event.event_date),
            event_type_id: this.eventTypes.find((t) => t.id === event.event_type_id),
            event_status_id: this.eventStatuses.find((s) => s.id === event.event_status_id),
            organization_id: event.organization_id ? this.organizations.find((o) => o.id === event.organization_id) : null
        });

        // Set contact
        if (event.responsible_contact) {
            this.eventForm.patchValue({
                responsible_contact: event.responsible_contact
            });
        }

        this.selectedFiles = [];
        this.existingFilesToKeep = event.files?.map((f) => f.id) || [];
        this.displayDialog.set(true);
    }

    /**
     * Search contacts for autocomplete
     */
    searchContacts(event: any) {
        const query = event.query.toLowerCase();

        this.contactService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (contacts) => {
                    this.filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(query));
                },
                error: (error) => {
                    console.error('Failed to search contacts:', error);
                }
            });
    }

    /**
     * Toggle between existing contact and create new
     */
    toggleContactMode() {
        this.showCreateContact = !this.showCreateContact;

        if (this.showCreateContact) {
            // Creating new - clear contact selection and add validators
            this.eventForm.get('responsible_contact')?.clearValidators();
            this.eventForm.get('responsible_fio')?.setValidators([Validators.required]);
            this.eventForm.get('responsible_phone')?.setValidators([Validators.required]);
        } else {
            // Using existing - clear creation fields and add validator
            this.eventForm.patchValue({
                responsible_fio: '',
                responsible_phone: ''
            });
            this.eventForm.get('responsible_contact')?.setValidators([Validators.required]);
            this.eventForm.get('responsible_fio')?.clearValidators();
            this.eventForm.get('responsible_phone')?.clearValidators();
        }

        this.eventForm.updateValueAndValidity();
    }

    /**
     * Handle file selection
     */
    onFileSelect(files: File[]) {
        this.selectedFiles = files;
    }

    /**
     * Remove selected file
     */
    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    /**
     * Remove existing file
     */
    removeExistingFile(fileId: number) {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        // Also remove from selected event's files for UI update
        if (this.selectedEvent?.files) {
            this.selectedEvent.files = this.selectedEvent.files.filter((f) => f.id !== fileId);
        }
    }

    /**
     * Show files dialog
     */
    showFiles(event: Event) {
        this.selectedEventForFiles = event;
        this.showFilesDialog = true;
    }

    /**
     * Submit form (create or update)
     */
    onSubmit() {
        this.submitted = true;

        // Validate form
        if (this.eventForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('PLANNING.COMMON.WARNING'),
                detail: this.translate.instant('PLANNING.COMMON.PLEASE_FILL_REQUIRED')
            });
            return;
        }

        if (this.isEditMode()) {
            this.updateEvent();
        } else {
            this.createEvent();
        }
    }

    /**
     * Build JSON payload from form values
     */
    private buildPayload(): EventCreatePayload {
        const formValue = this.eventForm.value;

        const payload: EventCreatePayload = {
            name: formValue.name,
            event_date: formValue.event_date.toISOString(),
            event_type_id: formValue.event_type_id.id
        };

        if (formValue.description) {
            payload.description = formValue.description;
        }
        if (formValue.location) {
            payload.location = formValue.location;
        }
        if (formValue.organization_id) {
            payload.organization_id = formValue.organization_id.id;
        }
        if (this.isEditMode() && formValue.event_status_id) {
            payload.event_status_id = formValue.event_status_id.id;
        }

        // Contact - either existing or new
        if (!this.showCreateContact) {
            payload.responsible_contact_id = formValue.responsible_contact?.id;
        } else {
            payload.responsible_fio = formValue.responsible_fio;
            payload.responsible_phone = formValue.responsible_phone;
        }

        return payload;
    }

    /**
     * Create new event
     */
    createEvent() {
        const payload = this.buildPayload();

        if (this.selectedFiles.length > 0) {
            this.apiService
                .uploadFiles(this.selectedFiles, 1)
                .pipe(
                    switchMap((res) => {
                        payload.file_ids = res.ids;
                        return this.eventService.createEvent(payload);
                    }),
                    takeUntil(this.destroy$)
                )
                .subscribe({
                    next: () => this.onEventSaveSuccess(false),
                    error: (error) => this.onEventSaveError(error, false)
                });
        } else {
            this.eventService
                .createEvent(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => this.onEventSaveSuccess(false),
                    error: (error) => this.onEventSaveError(error, false)
                });
        }
    }

    /**
     * Update existing event
     */
    updateEvent() {
        if (!this.selectedEvent) return;

        const payload: EventUpdatePayload = this.buildPayload();

        const originalFileIds = this.selectedEvent.files?.map((f) => f.id) || [];
        const filesModified =
            this.existingFilesToKeep.length !== originalFileIds.length ||
            !this.existingFilesToKeep.every((id) => originalFileIds.includes(id));

        if (this.selectedFiles.length > 0) {
            this.apiService
                .uploadFiles(this.selectedFiles, 1)
                .pipe(
                    switchMap((res) => {
                        payload.file_ids = [...this.existingFilesToKeep, ...res.ids];
                        return this.eventService.updateEvent(this.selectedEvent!.id, payload);
                    }),
                    takeUntil(this.destroy$)
                )
                .subscribe({
                    next: () => this.onEventSaveSuccess(true),
                    error: (error) => this.onEventSaveError(error, true)
                });
        } else {
            if (filesModified) {
                payload.file_ids = this.existingFilesToKeep;
            }
            this.eventService
                .updateEvent(this.selectedEvent.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => this.onEventSaveSuccess(true),
                    error: (error) => this.onEventSaveError(error, true)
                });
        }
    }

    private onEventSaveSuccess(isEdit: boolean): void {
        this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('PLANNING.COMMON.SUCCESS'),
            detail: this.translate.instant(isEdit ? 'PLANNING.EVENTS.UPDATED' : 'PLANNING.EVENTS.CREATED')
        });
        this.displayDialog.set(false);
        this.loadEvents();
    }

    private onEventSaveError(error: any, isEdit: boolean): void {
        console.error(isEdit ? 'Failed to update event:' : 'Failed to create event:', error);
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('PLANNING.COMMON.ERROR'),
            detail: error.error?.error || this.translate.instant(isEdit ? 'PLANNING.EVENTS.UPDATE_ERROR' : 'PLANNING.EVENTS.CREATE_ERROR')
        });
    }

    /**
     * Delete event
     */
    deleteEvent(event: Event) {
        const message = `${this.translate.instant('PLANNING.EVENTS.DELETE_CONFIRM')} "${event.name}"?`;
        if (confirm(message)) {
            this.eventService
                .deleteEvent(event.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('PLANNING.COMMON.SUCCESS'),
                            detail: this.translate.instant('PLANNING.EVENTS.DELETED')
                        });
                        this.loadEvents();
                    },
                    error: (error) => {
                        console.error('Failed to delete event:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('PLANNING.COMMON.ERROR'),
                            detail: this.translate.instant('PLANNING.EVENTS.DELETE_ERROR')
                        });
                    }
                });
        }
    }

    /**
     * Get severity for status tag
     */
    getStatusSeverity(statusId: number): 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast' {
        switch (statusId) {
            case 1:
                return 'secondary'; // Draft
            case 2:
                return 'info'; // Planned
            case 3:
                return 'success'; // Active
            case 4:
                return 'success'; // Completed
            case 5:
                return 'danger'; // Cancelled
            case 6:
                return 'warn'; // Postponed
            default:
                return 'secondary';
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
