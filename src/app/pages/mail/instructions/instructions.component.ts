import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Instruction, InstructionPayload, InstructionCategory, InstructionStatus } from '@/core/interfaces/instruction';
import { InstructionService } from '@/core/services/instruction.service';
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
    selector: 'app-instructions',
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
    templateUrl: './instructions.component.html',
    styleUrl: './instructions.component.scss'
})
export class InstructionsComponent implements OnInit, OnDestroy {
    instructions: Instruction[] = [];
    filteredInstructions: Instruction[] = [];
    loading = true;
    displayDialog = false;
    displayDeleteDialog = false;
    submitted = false;
    isEditMode = false;
    selectedInstruction: Instruction | null = null;

    instructionForm: FormGroup;

    selectedCategory: InstructionCategory | null = null;
    selectedStatus: InstructionStatus | null = null;

    categoryOptions = [
        { name: 'Все категории', value: null },
        { name: 'Безопасность', value: 'safety' },
        { name: 'Эксплуатация', value: 'operation' },
        { name: 'Техническая', value: 'technical' },
        { name: 'Административная', value: 'administrative' },
        { name: 'Прочее', value: 'other' }
    ];

    categoryFormOptions = [
        { name: 'Безопасность', value: 'safety' },
        { name: 'Эксплуатация', value: 'operation' },
        { name: 'Техническая', value: 'technical' },
        { name: 'Административная', value: 'administrative' },
        { name: 'Прочее', value: 'other' }
    ];

    statusOptions = [
        { name: 'Все статусы', value: null },
        { name: 'Действующая', value: 'active' },
        { name: 'Архивная', value: 'archived' },
        { name: 'На утверждении', value: 'pending' }
    ];

    statusFormOptions = [
        { name: 'Действующая', value: 'active' },
        { name: 'Архивная', value: 'archived' },
        { name: 'На утверждении', value: 'pending' }
    ];

    private instructionService = inject(InstructionService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    constructor() {
        this.instructionForm = this.fb.group({
            number: ['', Validators.required],
            date: [null, Validators.required],
            title: ['', Validators.required],
            description: [''],
            category: [null, Validators.required],
            status: [null, Validators.required],
            approvedBy: ['']
        });
    }

    ngOnInit() {
        this.loadInstructions();
    }

    private loadInstructions() {
        this.loading = true;
        this.instructionService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.instructions = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.instructions];

        if (this.selectedCategory) {
            result = result.filter(i => i.category === this.selectedCategory);
        }

        if (this.selectedStatus) {
            result = result.filter(i => i.status === this.selectedStatus);
        }

        this.filteredInstructions = result;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedInstruction = null;
        this.submitted = false;
        this.instructionForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(instruction: Instruction) {
        this.isEditMode = true;
        this.selectedInstruction = instruction;
        this.submitted = false;

        const categoryOption = this.categoryFormOptions.find(c => c.value === instruction.category);
        const statusOption = this.statusFormOptions.find(s => s.value === instruction.status);

        this.instructionForm.patchValue({
            number: instruction.number,
            date: instruction.date ? new Date(instruction.date) : null,
            title: instruction.title,
            description: instruction.description || '',
            category: categoryOption || null,
            status: statusOption || null,
            approvedBy: instruction.approvedBy || ''
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedInstruction = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.instructionForm.invalid) {
            return;
        }

        const formValue = this.instructionForm.value;
        const payload: InstructionPayload = {
            number: formValue.number,
            date: formValue.date instanceof Date
                ? formValue.date.toISOString().split('T')[0]
                : formValue.date,
            title: formValue.title,
            description: formValue.description || undefined,
            category: formValue.category?.value || formValue.category,
            status: formValue.status?.value || formValue.status,
            approvedBy: formValue.approvedBy || undefined
        };

        if (this.isEditMode && this.selectedInstruction) {
            this.instructionService
                .update(this.selectedInstruction.id, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Инструкция обновлена' });
                        this.loadInstructions();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить инструкцию' });
                    }
                });
        } else {
            this.instructionService
                .create(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Инструкция создана' });
                        this.loadInstructions();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать инструкцию' });
                    }
                });
        }
    }

    openDeleteDialog(instruction: Instruction) {
        this.selectedInstruction = instruction;
        this.displayDeleteDialog = true;
    }

    confirmDelete() {
        if (!this.selectedInstruction) return;

        this.instructionService
            .delete(this.selectedInstruction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Инструкция удалена' });
                    this.loadInstructions();
                    this.displayDeleteDialog = false;
                    this.selectedInstruction = null;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить инструкцию' });
                }
            });
    }

    getCategoryLabel(category: InstructionCategory): string {
        return this.instructionService.getCategoryLabel(category);
    }

    getCategorySeverity(category: InstructionCategory): any {
        return this.instructionService.getCategorySeverity(category);
    }

    getStatusLabel(status: InstructionStatus): string {
        return this.instructionService.getStatusLabel(status);
    }

    getStatusSeverity(status: InstructionStatus): any {
        return this.instructionService.getStatusSeverity(status);
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
