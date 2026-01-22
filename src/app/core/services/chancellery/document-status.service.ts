import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { DocumentStatus, StatusCode, StatusSeverity, STATUS_DISPLAY_CONFIG } from '@/core/interfaces/chancellery/document-status';
import { BASE_URL } from '@/core/services/api.service';

/**
 * Service for managing document statuses.
 * Provides access to the common /document-statuses endpoint
 * and utility methods for status display.
 */
@Injectable({
    providedIn: 'root'
})
export class DocumentStatusService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${BASE_URL}/document-statuses`;

    /** Cached statuses observable (shared across subscribers) */
    private statusesCache$?: Observable<DocumentStatus[]>;

    /**
     * Get all document statuses.
     * Results are cached for the lifetime of the service.
     */
    getStatuses(): Observable<DocumentStatus[]> {
        if (!this.statusesCache$) {
            this.statusesCache$ = this.http.get<DocumentStatus[]>(this.apiUrl).pipe(
                shareReplay(1)
            );
        }
        return this.statusesCache$;
    }

    /**
     * Clear the cached statuses (useful after status configuration changes)
     */
    clearCache(): void {
        this.statusesCache$ = undefined;
    }

    /**
     * Get status label for display
     */
    getStatusLabel(status: DocumentStatus | { code: string; name: string }): string {
        return status.name;
    }

    /**
     * Get severity class for PrimeNG Tag component
     */
    getStatusSeverity(code: string): StatusSeverity {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.severity ?? 'secondary';
    }

    /**
     * Get icon class for status
     */
    getStatusIcon(code: string): string {
        const config = STATUS_DISPLAY_CONFIG[code as StatusCode];
        return config?.icon ?? 'pi pi-file';
    }

    /**
     * Check if status is terminal (document cannot be edited/status changed)
     */
    isTerminalStatus(status: DocumentStatus): boolean {
        return status.is_terminal;
    }

    /**
     * Get non-terminal statuses (for status change dropdown)
     */
    getNonTerminalStatuses(statuses: DocumentStatus[]): DocumentStatus[] {
        return statuses.filter(s => !s.is_terminal);
    }

    /**
     * Get available next statuses based on current status
     * (This is a simplified version - actual workflow might be more complex)
     */
    getAvailableNextStatuses(currentStatus: DocumentStatus, allStatuses: DocumentStatus[]): DocumentStatus[] {
        if (currentStatus.is_terminal) {
            return [];
        }

        // Simple logic: allow transition to any non-current status
        // In real implementation, this might be based on workflow rules from backend
        return allStatuses.filter(s => s.id !== currentStatus.id);
    }
}
