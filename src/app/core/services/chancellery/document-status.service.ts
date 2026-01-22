import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DocumentStatus, StatusCode, StatusSeverity, STATUS_DISPLAY_CONFIG } from '@/core/interfaces/chancellery/document-status';

// Мок-данные статусов документов
const MOCK_STATUSES: DocumentStatus[] = [
    { id: 1, code: 'draft', name: 'Черновик', is_terminal: false },
    { id: 2, code: 'in_review', name: 'На рассмотрении', is_terminal: false },
    { id: 3, code: 'approved', name: 'Утверждён', is_terminal: false },
    { id: 4, code: 'rejected', name: 'Отклонён', is_terminal: true },
    { id: 5, code: 'completed', name: 'Завершён', is_terminal: true }
] as DocumentStatus[];

@Injectable({
    providedIn: 'root'
})
export class DocumentStatusService {
    private http = inject(HttpClient);

    private statusesCache$?: Observable<DocumentStatus[]>;

    getStatuses(): Observable<DocumentStatus[]> {
        if (!this.statusesCache$) {
            this.statusesCache$ = of(MOCK_STATUSES).pipe(
                delay(200),
                shareReplay(1)
            );
        }
        return this.statusesCache$;
    }

    clearCache(): void {
        this.statusesCache$ = undefined;
    }

    getStatusLabel(status: DocumentStatus | { code: string; name: string }): string {
        return status.name;
    }

    getStatusSeverity(code: string): StatusSeverity {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.severity ?? 'secondary';
    }

    getStatusIcon(code: string): string {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.icon ?? 'pi pi-file';
    }

    isTerminalStatus(status: DocumentStatus): boolean {
        return status.is_terminal;
    }

    getNonTerminalStatuses(statuses: DocumentStatus[]): DocumentStatus[] {
        return statuses.filter(s => !s.is_terminal);
    }

    getAvailableNextStatuses(currentStatus: DocumentStatus, allStatuses: DocumentStatus[]): DocumentStatus[] {
        if (currentStatus.is_terminal) {
            return [];
        }
        return allStatuses.filter(s => s.id !== currentStatus.id);
    }
}
