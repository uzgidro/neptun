/**
 * Report (Рапорт) specific interfaces
 * Endpoint: /reports
 */

import { DocumentResponse, DocumentPayload, DocumentFilters } from './document-base';

/** Report document response */
export interface Report extends DocumentResponse {}

/** Report creation/update payload */
export interface ReportPayload extends DocumentPayload {}

/** Report list filters */
export interface ReportFilters extends DocumentFilters {}
