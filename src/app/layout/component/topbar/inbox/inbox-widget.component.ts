import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Popover } from 'primeng/popover';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ReceptionService } from '@/core/services/reception.service';
import { Reception } from '@/core/interfaces/reception';
import { Tag } from 'primeng/tag';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';

@Component({
    selector: 'app-inbox',
    imports: [
        DatePipe,
        Popover,
        PrimeTemplate,
        Dialog,
        Tag,
        OverlayBadge,
        Button,
        ReactiveFormsModule,
        DatePickerComponent,
        TextareaComponent
    ],
    templateUrl: './inbox-widget.component.html',
    styleUrl: './inbox-widget.component.scss'
})
export class InboxWidget implements OnInit {
    receptionService = inject(ReceptionService);
    messageService = inject(MessageService);
    fb = inject(FormBuilder);

    pendingReceptions = signal<Reception[]>([]);
    loading = false;

    receptionDialogVisible = false;
    receptionDialogHeader = '';
    selectedReceptionDetails: Reception | null = null;
    loadingReceptionDetails = false;

    // Reject dialog
    rejectDialogVisible = false;
    rejectForm!: FormGroup;
    selectedReceptionForReject: Reception | null = null;
    submittedReject = false;

    // Reschedule dialog
    rescheduleDialogVisible = false;
    rescheduleForm!: FormGroup;
    selectedReceptionForReschedule: Reception | null = null;
    submittedReschedule = false;

    ngOnInit() {
        this.loadPendingReceptions();

        // Initialize forms
        this.rejectForm = this.fb.group({
            reason: ['', Validators.required]
        });

        this.rescheduleForm = this.fb.group({
            date: [null, Validators.required],
            reason: ['', Validators.required]
        });
    }

    onPopoverShow(): void {
        this.loadPendingReceptions();
    }

    loadPendingReceptions() {
        this.loading = true;
        this.receptionService.getReceptions('default').subscribe({
            next: (receptions) => {
                this.pendingReceptions.set(receptions);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load pending receptions:', err);
                this.loading = false;
            }
        });
    }

    openReceptionDetails(receptionId: number) {
        this.loadingReceptionDetails = true;
        this.receptionDialogVisible = true;
        this.receptionDialogHeader = 'Информация о приеме';

        this.receptionService.getReception(receptionId).subscribe({
            next: (reception) => {
                this.selectedReceptionDetails = reception;
                this.loadingReceptionDetails = false;
            },
            error: (err) => {
                console.error('Failed to load reception details:', err);
                this.loadingReceptionDetails = false;
                this.receptionDialogVisible = false;
            }
        });
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

    approveReception(reception: Reception): void {
        this.receptionService.updateReception(reception.id, { status: 'true' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Прием одобрен'
                });
                this.receptionDialogVisible = false;
                this.loadPendingReceptions();
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
        this.openRejectDialog(reception);
    }

    openRejectDialog(reception: Reception): void {
        this.selectedReceptionForReject = reception;
        this.rejectForm.reset();
        this.rejectDialogVisible = true;
        this.receptionDialogVisible = false;
    }

    saveRejection(): void {
        this.submittedReject = true;

        if (this.rejectForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Предупреждение',
                detail: 'Укажите причину отклонения'
            });
            return;
        }

        this.receptionService
            .updateReception(this.selectedReceptionForReject!.id, {
                status: 'false',
                status_change_reason: this.rejectForm.value.reason
            })
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Прием отклонен'
                    });
                    this.closeRejectDialog();
                    this.loadPendingReceptions();
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

    closeRejectDialog(): void {
        this.rejectDialogVisible = false;
        this.submittedReject = false;
        this.rejectForm.reset();
        this.selectedReceptionForReject = null;
    }

    openRescheduleDialog(reception: Reception): void {
        this.selectedReceptionForReschedule = reception;
        this.rescheduleForm.patchValue({
            date: reception.date,
            reason: ''
        });
        this.rescheduleDialogVisible = true;
        this.receptionDialogVisible = false;
    }

    saveReschedule(): void {
        this.submittedReschedule = true;

        if (this.rescheduleForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Предупреждение',
                detail: 'Заполните обязательные поля'
            });
            return;
        }

        const formValue = this.rescheduleForm.value;

        this.receptionService
            .updateReception(this.selectedReceptionForReschedule!.id, {
                status: 'true',
                date: formValue.date,
                status_change_reason: formValue.reason
            })
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Прием перенесен',
                        detail: 'Дата и время обновлены, прием одобрен'
                    });
                    this.closeRescheduleDialog();
                    this.loadPendingReceptions();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка переноса приема',
                        detail: err.message
                    });
                }
            });
    }

    closeRescheduleDialog(): void {
        this.rescheduleDialogVisible = false;
        this.submittedReschedule = false;
        this.rescheduleForm.reset();
        this.selectedReceptionForReschedule = null;
    }
}
