import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';

import { Reception } from '@/core/interfaces/reception';
import { ReceptionService } from '@/core/services/reception.service';
import { AuthService } from '@/core/services/auth.service';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

@Component({
    selector: 'app-reception',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        TranslateModule,
        TooltipModule,
        DialogModule,
        PrimeTemplate,
        DialogComponent,
        InputTextComponent,
        TextareaComponent,
        DatePickerComponent
    ],
    templateUrl: './reception.component.html',
    styleUrl: './reception.component.scss'
})
export class ReceptionComponent implements OnInit, OnDestroy {
    private receptionService = inject(ReceptionService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    receptions = signal<Reception[]>([]);
    loading = signal<boolean>(false);
    dialogVisible = signal<boolean>(false);

    selectedReception: Reception | null = null;
    receptionForm!: FormGroup;
    submitted = false;

    // View dialog
    viewDialogVisible = false;
    selectedReceptionForView: Reception | null = null;

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
            status: ['default'],
            togetherFields: this.fb.array([this.createTogetherField()])
        });
    }

    createTogetherField(): FormControl {
        return new FormControl('');
    }

    get togetherFields(): FormArray {
        return this.receptionForm.get('togetherFields') as FormArray;
    }

    addTogetherField(): void {
        this.togetherFields.push(this.createTogetherField());
    }

    removeTogetherField(index: number): void {
        if (this.togetherFields.length > 1) {
            this.togetherFields.removeAt(index);
        }
    }

    loadReceptions(): void {
        this.loading.set(true);
        this.receptionService
            .getReceptions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.receptions.set(data);
                    this.loading.set(false);
                },
                error: (error) => {
                    console.error('Error loading receptions:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('PLANNING.COMMON.ERROR'),
                        detail: this.translate.instant('PLANNING.RECEPTION.LOAD_ERROR')
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
        this.togetherFields.clear();
        this.togetherFields.push(this.createTogetherField());
        this.dialogVisible.set(true);
    }

    editReception(reception: Reception): void {
        this.selectedReception = reception;
        this.submitted = false;

        // Clear existing together fields
        this.togetherFields.clear();

        // Parse together field if it exists
        if (reception.together) {
            const togetherArray = reception.together.split(',').map((item) => item.trim());
            togetherArray.forEach((item) => {
                this.togetherFields.push(new FormControl(item));
            });
        } else {
            this.togetherFields.push(this.createTogetherField());
        }

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
        if (confirm(this.translate.instant('PLANNING.RECEPTION.DELETE_CONFIRM'))) {
            this.receptionService
                .deleteReception(reception.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('PLANNING.RECEPTION.DELETED')
                        });
                        this.loadReceptions();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('PLANNING.RECEPTION.DELETE_ERROR'),
                            detail: err.message
                        });
                    }
                });
        }
    }

    approveReception(reception: Reception): void {
        this.receptionService
            .updateReception(reception.id, { status: 'true' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('PLANNING.RECEPTION.APPROVED_SUCCESS')
                    });
                    this.loadReceptions();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('PLANNING.RECEPTION.APPROVE_ERROR'),
                        detail: err.message
                    });
                }
            });
    }

    rejectReception(reception: Reception): void {
        this.receptionService
            .updateReception(reception.id, { status: 'false' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('PLANNING.RECEPTION.REJECTED_SUCCESS')
                    });
                    this.loadReceptions();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('PLANNING.RECEPTION.REJECT_ERROR'),
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
                summary: this.translate.instant('PLANNING.COMMON.WARNING'),
                detail: this.translate.instant('PLANNING.COMMON.FILL_REQUIRED_FIELDS')
            });
            return;
        }

        const formValue = this.receptionForm.value;

        // Process togetherFields: collect values, replace commas with dots, join with commas
        const togetherString = formValue.togetherFields
            .filter((field: string) => field && field.trim())
            .map((field: string) => field.replace(/,/g, '.'))
            .join(', ');

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
            if (togetherString !== this.selectedReception.together) {
                editRequest.together = togetherString || undefined;
            }

            this.receptionService
                .updateReception(this.selectedReception.id, editRequest)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('PLANNING.COMMON.SUCCESS'),
                            detail: this.translate.instant('PLANNING.RECEPTION.UPDATED')
                        });
                        this.loadReceptions();
                        this.hideDialog();
                    },
                    error: (error) => {
                        console.error('Error updating reception:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('PLANNING.COMMON.ERROR'),
                            detail: this.translate.instant('PLANNING.RECEPTION.UPDATE_ERROR')
                        });
                    }
                });
        } else {
            // Prepare addRequest structure
            const addRequest = {
                name: formValue.name,
                date: formValue.date,
                visitor: formValue.visitor,
                description: formValue.description || undefined,
                together: togetherString || undefined
            };

            this.receptionService
                .createReception(addRequest)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('PLANNING.COMMON.SUCCESS'),
                            detail: this.translate.instant('PLANNING.RECEPTION.CREATED')
                        });
                        this.loadReceptions();
                        this.hideDialog();
                    },
                    error: (error) => {
                        console.error('Error creating reception:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('PLANNING.COMMON.ERROR'),
                            detail: this.translate.instant('PLANNING.RECEPTION.CREATE_ERROR')
                        });
                    }
                });
        }
    }

    hideDialog(): void {
        this.dialogVisible.set(false);
        this.submitted = false;
        this.receptionForm.reset({ status: 'default' });
        this.togetherFields.clear();
        this.togetherFields.push(this.createTogetherField());
        this.selectedReception = null;
    }

    informReception(reception: Reception): void {
        this.receptionService.updateReception(reception.id, { informed: true }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Успешно',
                    detail: 'Прием отмечен как проинформированный'
                });
                this.loadReceptions();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка',
                    detail: err.message
                });
            }
        });
    }

    canApproveReject(): boolean {
        return this.authService.hasRole(['rais', 'assistant']);
    }

    canInform(reception: Reception): boolean {
        return this.authService.isSc() && !reception.informed;
    }

    viewReception(reception: Reception): void {
        this.selectedReceptionForView = reception;
        this.viewDialogVisible = true;
    }

    closeViewDialog(): void {
        this.viewDialogVisible = false;
        this.selectedReceptionForView = null;
    }

    getStatusSeverity(reception: Reception): 'success' | 'danger' | 'secondary' | 'warn' {
        if (reception.status === 'true' && reception.status_change_reason) {
            return 'warn';
        }
        switch (reception.status) {
            case 'true':
                return 'success';
            case 'false':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getStatusLabel(reception: Reception): string {
        if (reception.status === 'true' && reception.status_change_reason) {
            return 'Перенесено';
        }
        switch (reception.status) {
            case 'true':
                return this.translate.instant('PLANNING.RECEPTION.STATUS.APPROVED');
            case 'false':
                return this.translate.instant('PLANNING.RECEPTION.STATUS.REJECTED');
            default:
                return this.translate.instant('PLANNING.RECEPTION.STATUS.PENDING');
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
