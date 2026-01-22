/**
 * Letter (Письмо) specific interfaces
 * Endpoint: /letters
 */

import { DocumentResponse, DocumentPayload, DocumentFilters } from './document-base';

/** Letter document response */
export interface Letter extends DocumentResponse {}

/** Letter creation/update payload */
export interface LetterPayload extends DocumentPayload {}

/** Letter list filters */
export interface LetterFilters extends DocumentFilters {}
