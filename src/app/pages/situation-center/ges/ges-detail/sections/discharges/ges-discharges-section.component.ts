import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { GesService } from '@/core/services/ges.service';
import { GesDischarge, DateRangeParams } from '@/core/interfaces/ges';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';

@Component({
    selector: 'app-ges-discharges-section',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonDirective,
        ButtonIcon,
        InputText,
        IconField,
        InputIcon,
        TooltipModule,
        DatePicker,
        TagModule,
        TranslateModule,
        DatePipe,
        DecimalPipe,
        DialogComponent,
        DatePickerComponent,
        TextareaComponent,
        InputNumberdComponent,
        FileUploadComponent,
        FileListComponent,
        FileViewerComponent
    ],
    templateUrl: './ges-discharges-section.component.html',
    styleUrl: './ges-discharges-section.component.scss'
})
export class GesDischargesSectionComponent implements OnInit, OnDestroy {
    @Input() gesId!: number;
    @Input() canEdit = false;

    private gesService = inject(GesService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    data: GesDischarge[] = [];
    loading = false;
    searchValue = '';

    startDate: Date | null = null;
    endDate: Date | null = null;

    form!: FormGroup;
    isFormOpen = false;
    isEditMode = false;
    isLoading = false;
    submitted = false;
    currentItemId: number | null = null;
    currentItem: GesDischarge | null = null;

    selectedFiles: File[] = [];
    existingFilesToKeep: number[] = [];
    showFilesDialog = false;
    selectedItemForFiles: GesDischarge | null = null;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initForm();
        this.loadData();
    }

    initForm(): void {
        this.form = this.fb.group({
            started_at: this.fb.control<Date | null>(null, [Validators.required]),
            ended_at: this.fb.control<Date | null>(null),
            flow_rate: this.fb.control<number | null>(null, [Validators.required]),
            reason: this.fb.control<string | null>(null)
        });
    }

    loadData(): void {
        this.loading = true;
        const dateRange: DateRangeParams = {};
        if (this.startDate) {
            dateRange.start_date = this.formatDate(this.startDate);
        }
        if (this.endDate) {
            dateRange.end_date = this.formatDate(this.endDate);
        }

        this.gesService
            .getDischarges(this.gesId, dateRange)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.data = data;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'GES_DETAIL.ERROR_LOADING',
                        detail: err.message
                    });
                    this.loading = false;
                },
                complete: () => {
                    this.loading = false;
                }
            });
    }

    onDateRangeChange(): void {
        this.loadData();
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    openNew(): void {
        this.isEditMode = false;
        this.currentItemId = null;
        this.currentItem = null;
        this.form.reset();
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.submitted = false;
        this.isFormOpen = true;
    }

    editItem(item: GesDischarge): void {
        this.isEditMode = true;
        this.currentItemId = item.id;
        this.currentItem = item;
        this.selectedFiles = [];
        this.existingFilesToKeep = item.files?.map((f) => f.id) || [];
        this.submitted = false;

        this.form.patchValue({
            started_at: item.started_at ? new Date(item.started_at) : null,
            ended_at: item.ended_at ? new Date(item.ended_at) : null,
            flow_rate: item.flow_rate,
            reason: item.reason
        });

        this.isFormOpen = true;
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;
        const rawPayload = this.form.getRawValue();
        const formData = new FormData();

        if (rawPayload.started_at) {
            formData.append('started_at', rawPayload.started_at.toISOString());
        }
        if (rawPayload.ended_at) {
            formData.append('ended_at', rawPayload.ended_at.toISOString());
        }
        if (rawPayload.flow_rate !== null) {
            formData.append('flow_rate', rawPayload.flow_rate.toString());
        }
        if (rawPayload.reason) {
            formData.append('reason', rawPayload.reason);
        }

        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        if (this.isEditMode) {
            formData.append('file_ids', this.existingFilesToKeep.join(','));
        }

        const request$ = this.isEditMode && this.currentItemId ? this.gesService.editDischarge(this.gesId, this.currentItemId, formData) : this.gesService.addDischarge(this.gesId, formData);

        request$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.isEditMode ? 'GES_DETAIL.UPDATED' : 'GES_DETAIL.CREATED'
                });
                this.closeDialog();
                this.loadData();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'GES_DETAIL.ERROR_SAVE',
                    detail: err.message
                });
                this.isLoading = false;
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    deleteItem(id: number): void {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            this.gesService.deleteDischarge(this.gesId, id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'GES_DETAIL.DELETED'
                    });
                    this.loadData();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'GES_DETAIL.ERROR_DELETE',
                        detail: err.message
                    });
                }
            });
        }
    }

    closeDialog(): void {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentItemId = null;
        this.currentItem = null;
        this.selectedFiles = [];
        this.existingFilesToKeep = [];
        this.form.reset();
    }

    onFileSelect(files: File[]): void {
        this.selectedFiles = files;
    }

    removeFile(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    removeExistingFile(fileId: number): void {
        this.existingFilesToKeep = this.existingFilesToKeep.filter((id) => id !== fileId);
        if (this.currentItem?.files) {
            this.currentItem.files = this.currentItem.files.filter((f) => f.id !== fileId);
        }
    }

    showFiles(item: GesDischarge): void {
        this.selectedItemForFiles = item;
        this.showFilesDialog = true;
    }

    clear(table: any): void {
        table.clear();
        this.searchValue = '';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
