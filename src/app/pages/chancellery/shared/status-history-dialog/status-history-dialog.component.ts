import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Timeline } from 'primeng/timeline';
import { Tag } from 'primeng/tag';
import { ButtonDirective } from 'primeng/button';
import { StatusHistoryEntry } from '@/core/interfaces/chancellery/document-status';
import { DocumentStatusService } from '@/core/services/chancellery/document-status.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-status-history-dialog',
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
            [header]="'CHANCELLERY.STATUS_HISTORY.TITLE' | translate"
            [(visible)]="visible"
            [modal]="true"
            [style]="{ width: '600px' }"
            [dismissableMask]="true"
            (onHide)="onClose()">

            @if (loading) {
                <div class="flex justify-center items-center py-8">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                </div>
            } @else if (history.length === 0) {
                <div class="text-center py-8 text-gray-500">
                    {{ 'CHANCELLERY.STATUS_HISTORY.NO_HISTORY' | translate }}
                </div>
            } @else {
                <p-timeline [value]="history" align="left" styleClass="customized-timeline">
                    <ng-template #content let-event>
                        <div class="flex flex-col gap-2 pb-4">
                            <div class="flex items-center gap-2">
                                @if (event.from_status) {
                                    <p-tag
                                        [value]="event.from_status.name"
                                        [severity]="statusService.getStatusSeverity(event.from_status.code)"
                                        [rounded]="true" />
                                    <i class="pi pi-arrow-right text-gray-400"></i>
                                }
                                <p-tag
                                    [value]="event.to_status.name"
                                    [severity]="statusService.getStatusSeverity(event.to_status.code)"
                                    [rounded]="true" />
                            </div>

                            @if (event.comment) {
                                <div class="text-sm text-gray-600 dark:text-gray-400 italic">
                                    "{{ event.comment }}"
                                </div>
                            }

                            <div class="flex items-center gap-2 text-xs text-gray-500">
                                <i class="pi pi-calendar"></i>
                                <span>{{ formatDateTime(event.changed_at) }}</span>
                                @if (event.changed_by) {
                                    <span>|</span>
                                    <i class="pi pi-user"></i>
                                    <span>{{ event.changed_by.name }}</span>
                                }
                            </div>
                        </div>
                    </ng-template>
                    <ng-template #marker let-event>
                        <span
                            class="flex w-8 h-8 items-center justify-center rounded-full border-2"
                            [class]="getMarkerClass(event)">
                            <i [class]="statusService.getStatusIcon(event.to_status.code)" class="text-sm"></i>
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
export class StatusHistoryDialogComponent {
    @Input() visible = false;
    @Input() history: StatusHistoryEntry[] = [];
    @Input() loading = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() close = new EventEmitter<void>();

    statusService = inject(DocumentStatusService);

    onClose(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.close.emit();
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

    getMarkerClass(event: StatusHistoryEntry): string {
        const severity = this.statusService.getStatusSeverity(event.to_status.code);
        const classes: Record<string, string> = {
            'success': 'bg-green-100 border-green-500 text-green-500',
            'danger': 'bg-red-100 border-red-500 text-red-500',
            'warn': 'bg-yellow-100 border-yellow-500 text-yellow-500',
            'info': 'bg-blue-100 border-blue-500 text-blue-500',
            'secondary': 'bg-gray-100 border-gray-500 text-gray-500'
        };
        return classes[severity] || classes['secondary'];
    }
}
