import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Message } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { DateWidget } from '@/layout/component/widget/date/date.widget';

import { DutyViolationService } from '@/core/services/duty-violation.service';
import { ApiService } from '@/core/services/api.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import {
    DutyViolationCreatePayload,
    DutyViolationDto,
    DutyViolationUpdatePayload
} from '@/core/interfaces/duty-violations';
import { Organization } from '@/core/interfaces/organizations';

/** Cross-field validator: end_time must be strictly after start_time. */
function endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('start_time')?.value as Date | null;
    const end = group.get('end_time')?.value as Date | null;
    if (!start || !end) return null;
    return new Date(end).getTime() > new Date(start).getTime() ? null : { endBeforeStart: true };
}

@Component({
    selector: 'app-duty-violations',
    standalone: true,
    imports: [
        Button,
        DatePipe,
        PrimeTemplate,
        ReactiveFormsModule,
        TableModule,
        TooltipModule,
        TranslateModule,
        Message,
        DatePickerComponent,
        DialogComponent,
        TextareaComponent,
        InputTextComponent,
        GroupSelectComponent,
        FileUploadComponent,
        FileListComponent,
        DateWidget
    ],
    templateUrl: './duty-violations.component.html'
})
export class DutyViolationsComponent implements OnInit, OnDestroy {
    authService = inject(AuthService);
    private fb = inject(FormBuilder);
    private organizationService = inject(OrganizationService);
    private violationService = inject(DutyViolationService);
    private apiService = inject(ApiService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    selectedDate: Date | null = null;

    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentViolationId: number | null = null;

    form!: FormGroup;

    organizations: any[] = [];
    violations: DutyViolationDto[] = [];
    loading = false;
    orgsLoading = false;

    // File handling
    selectedFiles: File[] = [];
    currentViolation: DutyViolationDto | null = null;
    existingFilesToKeep: number[] = [];
    filesDirty = false;

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            start_time: this.fb.control<Date | null>(null, [Validators.required]),
            end_time: this.fb.control<Date | null>(null),
            duty_officer_name: this.fb.control<string | null>(null, [Validators.required]),
            reason: this.fb.control<string | null>(null, [Validators.required])
        }, { validators: endAfterStartValidator });

        this.loadViolations();

        this.orgsLoading = true;
        this.organizationService.getCascades().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => (this.organizations = data),
            complete: () => (this.orgsLoading = false)
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadViolations();
    }

    private loadViolations(): void {
        this.loading = true;
        this.violationService.getViolations(this.selectedDate ?? undefined).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => (this.violations = data),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.message });
                this.loading = false;
            },
            complete: () => (this.loading = false)
        });
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        this.isLoading = true;
        const raw = this.form.getRawValue();
        const payload: DutyViolationCreatePayload & DutyViolationUpdatePayload = {} as any;

        if (raw.organization) payload.organization_id = raw.organization.id;
        if (raw.start_time) payload.start_time = new Date(raw.start_time).toISOString();
        if (raw.end_time) {
            payload.end_time = new Date(raw.end_time).toISOString();
        } else if (this.isEditMode) {
            // On edit, an empty end must be sent explicitly as null to reset a
            // closed shift back to ongoing (omitting = "leave unchanged"). On
            // create we omit it entirely (the backend defaults to ongoing).
            payload.end_time = null;
        }
        if (raw.duty_officer_name) payload.duty_officer_name = raw.duty_officer_name;
        if (raw.reason) payload.reason = raw.reason;

        const submitWithPayload = (p: typeof payload) => {
            if (this.isEditMode && this.currentViolationId) {
                this.violationService.editViolation(this.currentViolationId, p).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.DUTY_VIOLATION.UPDATED') });
                        this.closeDialog();
                    },
                    error: (err) => this.handleSubmitError(err, 'UPDATE_ERROR'),
                    complete: () => { this.isLoading = false; this.submitted = false; }
                });
            } else {
                this.violationService.addViolation(p).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.DUTY_VIOLATION.CREATED') });
                        this.closeDialog();
                    },
                    error: (err) => this.handleSubmitError(err, 'CREATE_ERROR'),
                    complete: () => { this.isLoading = false; this.submitted = false; }
                });
            }
        };

        if (this.selectedFiles.length > 0) {
            this.apiService.uploadFiles(this.selectedFiles, 1).pipe(takeUntil(this.destroy$)).subscribe({
                next: (res) => {
                    payload.file_ids = [...this.existingFilesToKeep, ...res.ids];
                    submitWithPayload(payload);
                },
                error: (err) => this.handleSubmitError(err, 'CREATE_ERROR')
            });
        } else if (this.filesDirty) {
            payload.file_ids = this.existingFilesToKeep;
            submitWithPayload(payload);
        } else {
            submitWithPayload(payload);
        }
    }

    private handleSubmitError(err: any, fallbackKey: 'CREATE_ERROR' | 'UPDATE_ERROR'): void {
        let detail = err?.error?.message;
        if (err?.status === 403) {
            detail = this.translate.instant('SITUATION_CENTER.DUTY_VIOLATION.ACCESS_DENIED');
        } else if (err?.status === 422) {
            detail = this.translate.instant('SITUATION_CENTER.DUTY_VIOLATION.NOT_FOUND');
        }
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant(`SITUATION_CENTER.DUTY_VIOLATION.${fallbackKey}`),
            detail
        });
        this.isLoading = false;
    }

    closeDialog(): void {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentViolationId = null;
        this.currentViolation = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        this.form.reset();
        this.loadViolations();
    }

    openNew(): void {
        this.isEditMode = false;
        this.currentViolationId = null;
        this.currentViolation = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.filesDirty = false;
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editViolation(v: DutyViolationDto): void {
        this.isEditMode = true;
        this.currentViolationId = v.id;
        this.currentViolation = v;
        this.submitted = false;
        this.isLoading = false;
        this.selectedFiles = [];
        this.existingFilesToKeep = v.files?.map((f) => f.id) ?? [];

        // Organizations are grouped by cascade — search inside each cascade's items.
        let foundOrg: any = null;
        for (const cascade of this.organizations) {
            const match = cascade.items?.find((o: any) => o.id === v.organization_id);
            if (match) { foundOrg = match; break; }
        }

        this.form.patchValue({
            organization: foundOrg,
            start_time: v.start_time,
            end_time: v.end_time,
            duty_officer_name: v.duty_officer_name,
            reason: v.reason
        });

        this.isFormOpen = true;
    }

    onFileSelect(files: File[]): void {
        this.selectedFiles = files;
    }

    removeFile(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    removeExistingFile(fileId: number): void {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        this.filesDirty = true;
        if (this.currentViolation?.files) {
            this.currentViolation.files = this.currentViolation.files.filter((f) => f.id !== fileId);
        }
    }

    /** 1-based index of an organization among the (already grouped) violations list. */
    getOrganizationIndex(organizationName?: string): number {
        const uniqueOrgs = [...new Set(this.violations.map((v) => v.organization_name))];
        return uniqueOrgs.indexOf(organizationName) + 1;
    }

    /** Composite row index "orgIndex.indexInOrg" (e.g. "1.2"). */
    getRowIndex(violation: DutyViolationDto): string {
        const orgIndex = this.getOrganizationIndex(violation.organization_name);
        const orgRows = this.violations.filter((v) => v.organization_name === violation.organization_name);
        const indexInOrg = orgRows.findIndex((v) => v.id === violation.id) + 1;
        return `${orgIndex}.${indexInOrg}`;
    }

    deleteViolation(id: number): void {
        if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
            this.violationService.deleteViolation(id).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.DUTY_VIOLATION.DELETED') });
                    this.loadViolations();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('SITUATION_CENTER.DUTY_VIOLATION.DELETE_ERROR'), detail: err.message });
                }
            });
        }
    }
}
