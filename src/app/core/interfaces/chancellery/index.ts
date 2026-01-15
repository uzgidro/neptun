/**
 * Chancellery Document Management System - Public API
 *
 * This module exports all interfaces for the document management system:
 * - Decrees (Приказы)
 * - Reports (Рапорты)
 * - Letters (Письма)
 * - Instructions (Инструкции)
 */

// Base interfaces
export * from './document-base';
export * from './document-status';

// Type-specific interfaces
export * from './decree';
export * from './report';
export * from './letter';
export * from './instruction';
export type {
    LegalDocument,
    LegalDocumentType,
    LegalDocumentPayload,
    LegalDocumentFilters,
    CreateLegalDocumentResponse
} from './legal-document';
