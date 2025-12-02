import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Popover } from 'primeng/popover';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ReceptionService } from '@/core/services/reception.service';
import { Reception } from '@/core/interfaces/reception';
import { Tag } from 'primeng/tag';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-inbox',
    imports: [DatePipe, Popover, PrimeTemplate, Dialog, Tag, OverlayBadge, Button],
    templateUrl: './inbox-widget.component.html',
    styleUrl: './inbox-widget.component.scss'
})
export class InboxWidget implements OnInit {
    receptionService = inject(ReceptionService);
    messageService = inject(MessageService);

    pendingReceptions = signal<Reception[]>([]);
    loading = false;

    receptionDialogVisible = false;
    receptionDialogHeader = '';
    selectedReceptionDetails: Reception | null = null;
    loadingReceptionDetails = false;

    ngOnInit() {
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
        this.receptionService.updateReception(reception.id, { status: 'false' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Прием отклонен'
                });
                this.receptionDialogVisible = false;
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
}
