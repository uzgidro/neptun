import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-inbox',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        TextareaComponent,
        TranslateModule
    ],
    templateUrl: './inbox-widget.component.html',
    styleUrl: './inbox-widget.component.scss'
})
export class InboxWidget implements OnInit, OnDestroy {
    private receptionService = inject(ReceptionService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private cdr = inject(ChangeDetectorRef);

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

    private destroy$ = new Subject<void>();

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
        this.receptionService.getReceptions('default').pipe(takeUntil(this.destroy$)).subscribe({
            next: (receptions) => {
                this.pendingReceptions.set(receptions);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    openReceptionDetails(receptionId: number) {
        this.loadingReceptionDetails = true;
        this.receptionDialogVisible = true;
        this.receptionDialogHeader = this.translate.instant('TOPBAR.RECEPTION_INFO');

        this.receptionService.getReception(receptionId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (reception) => {
                this.selectedReceptionDetails = reception;
                this.loadingReceptionDetails = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loadingReceptionDetails = false;
                this.receptionDialogVisible = false;
                this.cdr.markForCheck();
            }
        });
    }

    private readonly statusConfig: Record<string, { severity: 'success' | 'danger' | 'secondary' | 'warn'; labelKey: string }> = {
        true: { severity: 'success', labelKey: 'TOPBAR.STATUS_APPROVED' },
        false: { severity: 'danger', labelKey: 'TOPBAR.STATUS_REJECTED' }
    };

    getStatusSeverity(reception: Reception): 'success' | 'danger' | 'secondary' | 'warn' {
        if (reception.status === 'true' && reception.status_change_reason) {
            return 'warn';
        }
        return this.statusConfig[reception.status]?.severity ?? 'secondary';
    }

    getStatusLabel(reception: Reception): string {
        if (reception.status === 'true' && reception.status_change_reason) {
            return this.translate.instant('TOPBAR.STATUS_RESCHEDULED');
        }
        const config = this.statusConfig[reception.status];
        return config ? this.translate.instant(config.labelKey) : this.translate.instant('TOPBAR.STATUS_PENDING');
    }

    private showToast(severity: string, summaryKey: string, detail?: string): void {
        this.messageService.add({
            severity,
            summary: this.translate.instant(summaryKey),
            ...(detail && { detail })
        });
    }

    approveReception(reception: Reception): void {
        this.receptionService.updateReception(reception.id, { status: 'true' }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.showToast('success', 'TOPBAR.RECEPTION_APPROVED');
                this.receptionDialogVisible = false;
                this.cdr.markForCheck();
                this.loadPendingReceptions();
            },
            error: (err) => {
                this.showToast('error', 'TOPBAR.APPROVAL_ERROR', err.message);
                this.cdr.markForCheck();
            }
        });
    }

    rejectReception(reception: Reception): void {
        this.openDialog('reject', reception);
    }

    openDialog(type: 'reject' | 'reschedule', reception: Reception): void {
        if (type === 'reject') {
            this.selectedReceptionForReject = reception;
            this.rejectForm.reset();
            this.rejectDialogVisible = true;
        } else {
            this.selectedReceptionForReschedule = reception;
            this.rescheduleForm.patchValue({ date: reception.date, reason: '' });
            this.rescheduleDialogVisible = true;
        }
        this.receptionDialogVisible = false;
    }

    closeDialog(type: 'reject' | 'reschedule'): void {
        if (type === 'reject') {
            this.rejectDialogVisible = false;
            this.submittedReject = false;
            this.rejectForm.reset();
            this.selectedReceptionForReject = null;
        } else {
            this.rescheduleDialogVisible = false;
            this.submittedReschedule = false;
            this.rescheduleForm.reset();
            this.selectedReceptionForReschedule = null;
        }
    }

    saveRejection(): void {
        this.submittedReject = true;

        if (this.rejectForm.invalid) {
            this.showToast('warn', 'COMMON.WARNING', this.translate.instant('TOPBAR.SPECIFY_REJECTION_REASON'));
            return;
        }

        this.receptionService
            .updateReception(this.selectedReceptionForReject!.id, {
                status: 'false',
                status_change_reason: this.rejectForm.value.reason
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showToast('success', 'TOPBAR.RECEPTION_REJECTED');
                    this.closeDialog('reject');
                    this.cdr.markForCheck();
                    this.loadPendingReceptions();
                },
                error: (err) => {
                    this.showToast('error', 'TOPBAR.REJECTION_ERROR', err.message);
                    this.cdr.markForCheck();
                }
            });
    }

    openRescheduleDialog(reception: Reception): void {
        this.openDialog('reschedule', reception);
    }

    saveReschedule(): void {
        this.submittedReschedule = true;

        if (this.rescheduleForm.invalid) {
            this.showToast('warn', 'COMMON.WARNING', this.translate.instant('COMMON.FILL_REQUIRED'));
            return;
        }

        const formValue = this.rescheduleForm.value;

        this.receptionService
            .updateReception(this.selectedReceptionForReschedule!.id, {
                status: 'true',
                date: formValue.date,
                status_change_reason: formValue.reason
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showToast('success', 'TOPBAR.RECEPTION_RESCHEDULED', this.translate.instant('TOPBAR.DATE_UPDATED_APPROVED'));
                    this.closeDialog('reschedule');
                    this.cdr.markForCheck();
                    this.loadPendingReceptions();
                },
                error: (err) => {
                    this.showToast('error', 'TOPBAR.RESCHEDULE_ERROR', err.message);
                    this.cdr.markForCheck();
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
