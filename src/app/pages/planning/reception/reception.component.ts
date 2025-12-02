import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { Reception } from '@/core/interfaces/reception';
import { ReceptionService } from '@/core/services/reception.service';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

@Component({
    selector: 'app-reception',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, TooltipModule, DialogComponent, InputTextComponent, TextareaComponent, DatePickerComponent],
    templateUrl: './reception.component.html',
    styleUrl: './reception.component.scss'
})
export class ReceptionComponent implements OnInit {
    private receptionService = inject(ReceptionService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    receptions = signal<Reception[]>([]);
    loading = signal<boolean>(false);
    dialogVisible = signal<boolean>(false);

    selectedReception: Reception | null = null;
    receptionForm!: FormGroup;
    submitted = false;

    ngOnInit(): void {
        this.initForm();
        this.loadReceptions();
    }

    initForm(): void {
        this.receptionForm = this.fb.group({
            name: ['', Validators.required],
            date: [null, Validators.required],
            visitor: ['', Validators.required],
            description: [''],
            status: ['default']
        });
    }

    loadReceptions(): void {
        this.loading.set(true);
        this.receptionService.getReceptions().subscribe({
            next: (data) => {
                this.receptions.set(data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading receptions:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка',
                    detail: 'Не удалось загрузить приемы'
                });
                this.loading.set(false);
            }
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew(): void {
        this.selectedReception = null;
        this.submitted = false;
        this.receptionForm.reset({ status: 'default' });
        this.dialogVisible.set(true);
    }

    editReception(reception: Reception): void {
        this.selectedReception = reception;
        this.submitted = false;
        this.receptionForm.patchValue({
            name: reception.name,
            date: reception.date,
            visitor: reception.visitor,
            description: reception.description,
            status: reception.status
        });
        this.dialogVisible.set(true);
    }

    deleteReception(reception: Reception): void {
        if (confirm('Вы уверены, что хотите удалить этот прием?')) {
            this.receptionService.deleteReception(reception.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Прием удален'
                    });
                    this.loadReceptions();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка удаления приема',
                        detail: err.message
                    });
                }
            });
        }
    }

    approveReception(reception: Reception): void {
        this.receptionService.updateReception(reception.id, { status: 'true' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Прием одобрен'
                });
                this.loadReceptions();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка одобрения приема',
                    detail: err.message
                });
            }
        });
    }

    rejectReception(reception: Reception): void {
        this.receptionService.updateReception(reception.id, { status: 'false' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Прием отклонен'
                });
                this.loadReceptions();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка отклонения приема',
                    detail: err.message
                });
            }
        });
    }

    saveReception(): void {
        this.submitted = true;

        if (this.receptionForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Предупреждение',
                detail: 'Заполните все обязательные поля'
            });
            return;
        }

        const formValue = this.receptionForm.value;

        if (this.selectedReception) {
            // Edit mode - prepare editRequest structure
            const editRequest: any = {};

            if (formValue.name !== this.selectedReception.name) {
                editRequest.name = formValue.name;
            }
            if (formValue.date !== this.selectedReception.date) {
                editRequest.date = formValue.date;
            }
            if (formValue.description !== this.selectedReception.description) {
                editRequest.description = formValue.description;
            }
            if (formValue.visitor !== this.selectedReception.visitor) {
                editRequest.visitor = formValue.visitor;
            }
            if (formValue.status !== this.selectedReception.status) {
                editRequest.status = formValue.status;
            }

            this.receptionService.updateReception(this.selectedReception.id, editRequest).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Прием обновлен'
                    });
                    this.loadReceptions();
                    this.hideDialog();
                },
                error: (error) => {
                    console.error('Error updating reception:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось обновить прием'
                    });
                }
            });
        } else {
            // Prepare addRequest structure
            const addRequest = {
                name: formValue.name,
                date: formValue.date,
                visitor: formValue.visitor,
                description: formValue.description || undefined
            };

            this.receptionService.createReception(addRequest).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Прием создан'
                    });
                    this.loadReceptions();
                    this.hideDialog();
                },
                error: (error) => {
                    console.error('Error creating reception:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось создать прием'
                    });
                }
            });
        }
    }

    hideDialog(): void {
        this.dialogVisible.set(false);
        this.submitted = false;
        this.receptionForm.reset({ status: 'default' });
        this.selectedReception = null;
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'secondary' {
        switch (status) {
            case 'true':
                return 'success';
            case 'false':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'true':
                return 'Одобрено';
            case 'false':
                return 'Отклонено';
            default:
                return 'Ожидание';
        }
    }
}
