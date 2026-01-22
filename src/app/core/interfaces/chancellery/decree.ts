/**
 * Decree (Приказ) specific interfaces
 * Endpoint: /decrees
 */

import { DocumentResponse, DocumentPayload, DocumentFilters } from './document-base';

/** Decree document response */
export interface Decree extends DocumentResponse {}

/** Decree creation/update payload */
export interface DecreePayload extends DocumentPayload {}

/** Decree list filters */
export interface DecreeFilters extends DocumentFilters {}
