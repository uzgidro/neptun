import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { GesService } from '@/core/services/ges.service';
import { GesVisit, DateRangeParams } from '@/core/interfaces/ges';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { FileListComponent } from '@/layout/component/dialog/file-list/file-list.component';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';

@Component({
    selector: 'app-ges-visits-section',
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
        TranslateModule,
        DatePipe,
        DialogComponent,
        DatePickerComponent,
        TextareaComponent,
        InputTextComponent,
        FileUploadComponent,
        FileListComponent,
        FileViewerComponent
    ],
    templateUrl: './ges-visits-section.component.html',
    styleUrl: './ges-visits-section.component.scss'
})
export class GesVisitsSectionComponent implements OnInit, OnDestroy {
    @Input() gesId!: number;
    @Input() canEdit = false;

    private gesService = inject(GesService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    data: GesVisit[] = [];
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
    currentItem: GesVisit | null = null;

    selectedFiles: File[] = [];
    existingFilesToKeep: number[] = [];
    showFilesDialog = false;
    selectedItemForFiles: GesVisit | null = null;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initForm();
        this.loadData();
    }

    initForm(): void {
        this.form = this.fb.group({
            visit_date: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required]),
            responsible_name: this.fb.control<string | null>(null, [Validators.required])
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
            .getVisits(this.gesId, dateRange)
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

    editItem(item: GesVisit): void {
        this.isEditMode = true;
        this.currentItemId = item.id;
        this.currentItem = item;
        this.selectedFiles = [];
        this.existingFilesToKeep = item.files?.map((f) => f.id) || [];
        this.submitted = false;

        this.form.patchValue({
            visit_date: item.visit_date ? new Date(item.visit_date) : null,
            description: item.description,
            responsible_name: item.responsible_name
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

        if (rawPayload.visit_date) {
            formData.append('visit_date', rawPayload.visit_date.toISOString());
        }
        if (rawPayload.description) {
            formData.append('description', rawPayload.description);
        }
        if (rawPayload.responsible_name) {
            formData.append('responsible_name', rawPayload.responsible_name);
        }

        this.selectedFiles.forEach((file) => {
            formData.append('files', file, file.name);
        });

        if (this.isEditMode) {
            formData.append('file_ids', this.existingFilesToKeep.join(','));
        }

        const request$ = this.isEditMode && this.currentItemId ? this.gesService.editVisit(this.gesId, this.currentItemId, formData) : this.gesService.addVisit(this.gesId, formData);

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
            this.gesService.deleteVisit(this.gesId, id).subscribe({
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

    showFiles(item: GesVisit): void {
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
