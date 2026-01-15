/**
 * Document status interfaces for Chancellery document management system
 */

import { UserShort, DocumentStatusShort } from './document-base';

/** Status code enum */
export type StatusCode =
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'in_execution'
    | 'executed'
    | 'cancelled';

/** Full document status from /document-statuses endpoint */
export interface DocumentStatus {
    id: number;
    code: StatusCode;
    name: string;
    description?: string;
    display_order: number;
    is_terminal: boolean;
}

/** Status history entry from /{type}/{id}/history endpoint */
export interface StatusHistoryEntry {
    id: number;
    from_status?: DocumentStatusShort;
    to_status: DocumentStatusShort;
    changed_at: string; // ISO datetime
    changed_by?: UserShort;
    comment?: string;
}

/** Request body for status change PATCH /{type}/{id}/status */
export interface ChangeStatusRequest {
    status_id: number;
    comment?: string;
}

/** Status severity for UI display (PrimeNG Tag) */
export type StatusSeverity = 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast';

/** Status display configuration */
export interface StatusDisplayConfig {
    code: StatusCode;
    label: string;
    severity: StatusSeverity;
    icon?: string;
}

/** Default status configurations for UI */
export const STATUS_DISPLAY_CONFIG: Record<StatusCode, Omit<StatusDisplayConfig, 'label'>> = {
    draft: { code: 'draft', severity: 'secondary', icon: 'pi pi-file-edit' },
    pending_approval: { code: 'pending_approval', severity: 'warn', icon: 'pi pi-clock' },
    approved: { code: 'approved', severity: 'success', icon: 'pi pi-check-circle' },
    rejected: { code: 'rejected', severity: 'danger', icon: 'pi pi-times-circle' },
    in_execution: { code: 'in_execution', severity: 'info', icon: 'pi pi-spinner' },
    executed: { code: 'executed', severity: 'success', icon: 'pi pi-verified' },
    cancelled: { code: 'cancelled', severity: 'secondary', icon: 'pi pi-ban' }
};
