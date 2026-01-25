import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '@/core/services/api.service';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { FileUpload } from 'primeng/fileupload';
import { LatestFiles } from '@/core/interfaces/latest-files';
import { Categories } from '@/core/interfaces/categories';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

@Component({
    selector: 'app-files',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, Dialog, FormsModule, IconField, InputIcon, InputText, ReactiveFormsModule, Select, TableModule, FileUpload, DatePickerComponent],
    templateUrl: './files.component.html',
    styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit, OnDestroy {
    files: LatestFiles[] = [];
    categories: Categories[] = [];
    loading = false;
    displayDialog = false;
    uploadForm: FormGroup;

    private apiService = inject(ApiService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.uploadForm = this.fb.group({
            category_id: [null, Validators.required],
            date: [new Date(), Validators.required]
        });
    }

    ngOnInit() {
        this.loading = true;
        this.loadLatestFiles();
        this.loadCategories();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.uploadForm.reset();
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
    }

    handleFileUpload(event: { files: File[] }, uploader: FileUpload) {
        if (this.uploadForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Внимание', detail: 'Выберите категорию и дату' });
            return;
        }

        const { category_id, date } = this.uploadForm.value;

        // Format date as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const uploadObservables = event.files.map((file) => this.apiService.uploadFile(file, category_id.id, dateStr));

        forkJoin(uploadObservables)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => uploader.clear()) // Очищаем список файлов после загрузки
            )
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: `Загружено ${event.files.length} файл(ов)` });
                    this.loadLatestFiles();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить файлы' });
                    console.error(err);
                }
            });
    }

    deleteFile(id: number): void {
        this.apiService
            .deleteFile(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Файл успешно удален' });
                    this.files = this.files.filter((file) => file.id !== id); // Корректное удаление из массива
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить файл' });
                    console.error(err);
                }
            });
    }

    private loadLatestFiles(): void {
        this.apiService.getLatestFiles().subscribe({
            next: (data) => {
                this.files = data;
            },
            error: () => {},
            complete: () => {
                this.loading = false;
            }
        });
    }

    private loadCategories() {
        this.apiService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
            },
            error: () => {}
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
