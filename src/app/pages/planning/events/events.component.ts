import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';

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
import { ConfirmationService, MessageService } from 'primeng/api';

// Interfaces
import { Event, EventFilters, EventStatus, EventType } from '@/core/interfaces/event-management';
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
        ConfirmDialogModule,
        ToastModule,
        AutoCompleteModule,
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
    providers: [MessageService, ConfirmationService],
    templateUrl: './events.component.html',
    styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit, OnDestroy {
    // Services
    private eventService = inject(EventManagementService);
    private contactService = inject(ContactService);
    private organizationService = inject(OrganizationService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
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
                        summary: 'Ошибка',
                        detail: 'Не удалось загрузить справочные данные'
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
                        summary: 'Ошибка',
                        detail: 'Не удалось загрузить события'
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
     * Apply filters
     */
    applyFilters() {
        this.loadEvents();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filterForm.reset();
        this.loadEvents();
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
            .getContacts()
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
     * Format file size
     */
    formatFileSize(bytes: number): string {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
                summary: 'Внимание',
                detail: 'Пожалуйста, заполните все обязательные поля'
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
     * Create new event
     */
    createEvent() {
        const formData = this.buildFormData();

        this.eventService
            .createEvent(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успех',
                        detail: 'Событие успешно создано'
                    });
                    this.displayDialog.set(false);
                    this.loadEvents();
                },
                error: (error) => {
                    console.error('Failed to create event:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: error.error?.error || 'Не удалось создать событие'
                    });
                }
            });
    }

    /**
     * Update existing event
     */
    updateEvent() {
        if (!this.selectedEvent) return;

        const formData = this.buildFormData();

        console.log(formData);

        this.eventService
            .updateEvent(this.selectedEvent.id, formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успех',
                        detail: 'Событие успешно обновлено'
                    });
                    this.displayDialog.set(false);
                    this.loadEvents();
                },
                error: (error) => {
                    console.error('Failed to update event:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: error.error?.error || 'Не удалось обновить событие'
                    });
                }
            });
    }

    /**
     * Build FormData for API submission
     */
    buildFormData(): FormData {
        const formData = new FormData();
        const formValue = this.eventForm.value;

        // Required fields
        formData.append('name', formValue.name);
        formData.append('event_date', formValue.event_date.toISOString());
        formData.append('event_type_id', formValue.event_type_id.id.toString());

        // Optional fields
        if (formValue.description) {
            formData.append('description', formValue.description);
        }
        if (formValue.location) {
            formData.append('location', formValue.location);
        }
        if (formValue.organization_id) {
            formData.append('organization_id', formValue.organization_id.id.toString());
        }
        if (this.isEditMode() && formValue.event_status_id) {
            formData.append('event_status_id', formValue.event_status_id.id.toString());
        }

        // Contact - either existing or new
        if (!this.showCreateContact) {
            formData.append('responsible_contact_id', formValue.responsible_contact.id);
        } else if (this.showCreateContact) {
            formData.append('responsible_fio', formValue.responsible_fio);
            formData.append('responsible_phone', formValue.responsible_phone);
        }

        // Files - only for new files
        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        // Existing files to keep (only in edit mode)
        if (this.isEditMode()) {
            formData.append('file_ids', this.existingFilesToKeep.join(','));
        }

        return formData;
    }

    /**
     * Delete event
     */
    deleteEvent(event: Event) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить событие "${event.name}"?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Да',
            rejectLabel: 'Отмена',
            accept: () => {
                this.eventService
                    .deleteEvent(event.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Успех',
                                detail: 'Событие успешно удалено'
                            });
                            this.loadEvents();
                        },
                        error: (error) => {
                            console.error('Failed to delete event:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Ошибка',
                                detail: 'Не удалось удалить событие'
                            });
                        }
                    });
            }
        });
    }

    /**
     * Get severity for status tag
     */
    getStatusSeverity(statusId: number): string {
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
                return 'warning'; // Postponed
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
