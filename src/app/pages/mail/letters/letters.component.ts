import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Letter, LetterPayload, LetterType, LetterStatus } from '@/core/interfaces/letter';
import { LetterService } from '@/core/services/letter.service';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';

@Component({
    selector: 'app-letters',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        Tag,
        ButtonDirective,
        ButtonIcon,
        ButtonLabel,
        IconField,
        InputIcon,
        InputText,
        Tooltip,
        Select,
        DialogComponent,
        InputTextComponent,
        SelectComponent,
        TextareaComponent,
        DatePickerComponent,
        DeleteConfirmationComponent
    ],
    templateUrl: './letters.component.html',
    styleUrl: './letters.component.scss'
})
export class LettersComponent implements OnInit, OnDestroy {
    letters: Letter[] = [];
    filteredLetters: Letter[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedLetter: Letter | null = null;

    letterForm: FormGroup;

    selectedType: LetterType | null = null;
    selectedStatus: LetterStatus | null = null;

    typeOptions = [
        { name: 'Все типы', value: null },
        { name: 'Входящее', value: 'incoming' },
        { name: 'Исходящее', value: 'outgoing' }
    ];

    typeFormOptions = [
        { name: 'Входящее', value: 'incoming' },
        { name: 'Исходящее', value: 'outgoing' }
    ];

    statusOptions = [
        { name: 'Все статусы', value: null },
        { name: 'Черновик', value: 'draft' },
        { name: 'Отправлено', value: 'sent' },
        { name: 'Получено', value: 'received' },
        { name: 'Прочитано', value: 'read' }
    ];

    statusFormOptions = [
        { name: 'Черновик', value: 'draft' },
        { name: 'Отправлено', value: 'sent' },
        { name: 'Получено', value: 'received' },
        { name: 'Прочитано', value: 'read' }
    ];

    private letterService = inject(LetterService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    constructor() {
        this.letterForm = this.fb.group({
            number: ['', Validators.required],
            date: [null, Validators.required],
            type: [null, Validators.required],
            from: ['', Validators.required],
            to: ['', Validators.required],
            subject: ['', Validators.required],
            content: [''],
            status: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadLetters();
    }

    private loadLetters() {
        this.loading = true;
        this.letterService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.letters = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.letters];

        if (this.selectedType) {
            result = result.filter(l => l.type === this.selectedType);
        }

        if (this.selectedStatus) {
            result = result.filter(l => l.status === this.selectedStatus);
        }

        this.filteredLetters = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedLetter = null;
        this.submitted = false;
        this.letterForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(letter: Letter) {
        this.isEditMode = true;
        this.selectedLetter = letter;
        this.submitted = false;

        const typeOption = this.typeFormOptions.find(t => t.value === letter.type);
        const statusOption = this.statusFormOptions.find(s => s.value === letter.status);

        this.letterForm.patchValue({
            number: letter.number,
            date: letter.date ? new Date(letter.date) : null,
            type: typeOption || null,
            from: letter.from,
            to: letter.to,
            subject: letter.subject,
            content: letter.content || '',
            status: statusOption || null
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedLetter = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.letterForm.invalid) {
            return;
        }

        const formValue = this.letterForm.value;
        const payload: LetterPayload = {
            number: formValue.number,
            date: formValue.date instanceof Date
                ? formValue.date.toISOString().split('T')[0]
                : formValue.date,
            type: formValue.type?.value || formValue.type,
            from: formValue.from,
            to: formValue.to,
            subject: formValue.subject,
            content: formValue.content || undefined,
            status: formValue.status?.value || formValue.status
        };

        if (this.isEditMode && this.selectedLetter) {
            this.letterService
                .update(this.selectedLetter.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Письмо обновлено' });
                        this.loadLetters();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить письмо' });
                    }
                });
        } else {
            this.letterService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Письмо создано' });
                        this.loadLetters();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать письмо' });
                    }
                });
        }
    }

    openDeleteDialog(letter: Letter) {
        this.selectedLetter = letter;
        this.displayDeleteDialog = true;
    }

    confirmDelete() {
        if (!this.selectedLetter) return;

        this.letterService
            .delete(this.selectedLetter.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Письмо удалено' });
                    this.loadLetters();
                    this.displayDeleteDialog = false;
                    this.selectedLetter = null;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить письмо' });
                }
            });
    }

    getTypeLabel(type: LetterType): string {
        return this.letterService.getTypeLabel(type);
    }

    getTypeSeverity(type: LetterType): any {
        return this.letterService.getTypeSeverity(type);
    }

    getStatusLabel(status: LetterStatus): string {
        return this.letterService.getStatusLabel(status);
    }

    getStatusSeverity(status: LetterStatus): any {
        return this.letterService.getStatusSeverity(status);
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
