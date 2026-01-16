import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Timeline } from 'primeng/timeline';
import { Tag } from 'primeng/tag';
import { ButtonDirective } from 'primeng/button';
import { Signature } from '@/core/interfaces/chancellery/signature';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-signature-history-dialog',
    standalone: true,
    imports: [
        CommonModule,
        Dialog,
        Timeline,
        Tag,
        ButtonDirective,
        TranslateModule
    ],
    template: `
        <p-dialog
            [header]="'CHANCELLERY.SIGNATURE.HISTORY_TITLE' | translate"
            [(visible)]="visible"
            [modal]="true"
            [style]="{ width: '600px' }"
            [dismissableMask]="true"
            (onHide)="onClose()">

            @if (loading) {
                <div class="flex justify-center items-center py-8">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                </div>
            } @else if (signatures.length === 0) {
                <div class="text-center py-8 text-gray-500">
                    {{ 'CHANCELLERY.SIGNATURE.NO_HISTORY' | translate }}
                </div>
            } @else {
                <p-timeline [value]="signatures" align="left" styleClass="customized-timeline">
                    <ng-template #content let-signature>
                        <div class="flex flex-col gap-2 pb-4">
                            <!-- Action Badge -->
                            <div class="flex items-center gap-2">
                                <p-tag
                                    [value]="getActionLabel(signature.action)"
                                    [severity]="getActionSeverity(signature.action)"
                                    [rounded]="true" />
                            </div>

                            <!-- Resolution or Rejection Reason -->
                            @if (signature.resolution_text) {
                                <div class="text-sm text-gray-600 dark:text-gray-400">
                                    <span class="font-medium">{{ 'CHANCELLERY.SIGNATURE.RESOLUTION' | translate }}:</span>
                                    <span class="italic ml-1">"{{ signature.resolution_text }}"</span>
                                </div>
                            }

                            @if (signature.rejection_reason) {
                                <div class="text-sm text-red-600 dark:text-red-400">
                                    <span class="font-medium">{{ 'CHANCELLERY.SIGNATURE.REJECTION_REASON' | translate }}:</span>
                                    <span class="italic ml-1">"{{ signature.rejection_reason }}"</span>
                                </div>
                            }

                            <!-- Assigned Executor -->
                            @if (signature.assigned_executor) {
                                <div class="text-sm text-gray-600 dark:text-gray-400">
                                    <span class="font-medium">{{ 'CHANCELLERY.SIGNATURE.ASSIGNED_EXECUTOR' | translate }}:</span>
                                    <span class="ml-1">{{ signature.assigned_executor.name }}</span>
                                </div>
                            }

                            <!-- Assigned Due Date -->
                            @if (signature.assigned_due_date) {
                                <div class="text-sm text-gray-600 dark:text-gray-400">
                                    <span class="font-medium">{{ 'CHANCELLERY.SIGNATURE.ASSIGNED_DUE_DATE' | translate }}:</span>
                                    <span class="ml-1">{{ formatDate(signature.assigned_due_date) }}</span>
                                </div>
                            }

                            <!-- Metadata -->
                            <div class="flex items-center gap-2 text-xs text-gray-500">
                                <i class="pi pi-calendar"></i>
                                <span>{{ formatDateTime(signature.signed_at) }}</span>
                                @if (signature.signed_by) {
                                    <span>|</span>
                                    <i class="pi pi-user"></i>
                                    <span>{{ signature.signed_by.name }}</span>
                                }
                            </div>
                        </div>
                    </ng-template>
                    <ng-template #marker let-signature>
                        <span
                            class="flex w-8 h-8 items-center justify-center rounded-full border-2"
                            [class]="getMarkerClass(signature.action)">
                            <i [class]="getActionIcon(signature.action)" class="text-sm"></i>
                        </span>
                    </ng-template>
                </p-timeline>
            }

            <ng-template #footer>
                <button
                    pButton
                    type="button"
                    [label]="'COMMON.CLOSE' | translate"
                    severity="secondary"
                    (click)="onClose()">
                </button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep .customized-timeline {
            .p-timeline-event-opposite {
                display: none;
            }
            .p-timeline-event-content {
                line-height: 1.5;
            }
        }
    `]
})
export class SignatureHistoryDialogComponent {
    @Input() visible = false;
    @Input() signatures: Signature[] = [];
    @Input() loading = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() close = new EventEmitter<void>();

    onClose(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.close.emit();
    }

    getActionLabel(action: 'signed' | 'rejected'): string {
        return action === 'signed' ? 'CHANCELLERY.SIGNATURE.ACTION_SIGNED' : 'CHANCELLERY.SIGNATURE.ACTION_REJECTED';
    }

    getActionSeverity(action: 'signed' | 'rejected'): 'success' | 'danger' {
        return action === 'signed' ? 'success' : 'danger';
    }

    getActionIcon(action: 'signed' | 'rejected'): string {
        return action === 'signed' ? 'pi pi-check' : 'pi pi-times';
    }

    getMarkerClass(action: 'signed' | 'rejected'): string {
        return action === 'signed'
            ? 'bg-green-100 border-green-500 text-green-500'
            : 'bg-red-100 border-red-500 text-red-500';
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    formatDateTime(dateStr: string): string {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
