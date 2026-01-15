/**
 * Instruction (Инструкция) specific interfaces
 * Endpoint: /instructions
 */

import { DocumentResponse, DocumentPayload, DocumentFilters } from './document-base';

/** Instruction document response */
export interface Instruction extends DocumentResponse {}

/** Instruction creation/update payload */
export interface InstructionPayload extends DocumentPayload {}

/** Instruction list filters */
export interface InstructionFilters extends DocumentFilters {}
