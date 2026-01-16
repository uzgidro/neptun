import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    SignableDocumentType,
    PendingDocument,
    SignDocumentRequest,
    SignatureResponse,
    RejectSignatureRequest,
    Signature
} from '@/core/interfaces/chancellery/signature';
import { BASE_URL } from '@/core/services/api.service';

/**
 * Service for document signature operations.
 * Handles pending documents, signing, rejecting, and signature history.
 */
@Injectable({
    providedIn: 'root'
})
export class DocumentSignatureService {
    private http = inject(HttpClient);
    private readonly apiUrl = BASE_URL;

    /**
     * Get all documents pending signature for current user
     */
    getPendingDocuments(): Observable<PendingDocument[]> {
        return this.http.get<PendingDocument[]>(`${this.apiUrl}/documents/pending-signature`);
    }

    /**
     * Sign a document with optional resolution
     * @param docType - Type of document (decree, report, letter, instruction)
     * @param id - Document ID
     * @param request - Sign request with optional resolution text, executor, and due date
     */
    signDocument(docType: SignableDocumentType, id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.apiUrl}/${docType}s/${id}/sign`, request);
    }

    /**
     * Reject a document signature with optional reason
     * @param docType - Type of document (decree, report, letter, instruction)
     * @param id - Document ID
     * @param request - Reject request with optional reason
     */
    rejectSignature(docType: SignableDocumentType, id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.apiUrl}/${docType}s/${id}/reject-signature`, request);
    }

    /**
     * Get signature history for a document
     * @param docType - Type of document (decree, report, letter, instruction)
     * @param id - Document ID
     */
    getSignatures(docType: SignableDocumentType, id: number): Observable<Signature[]> {
        return this.http.get<Signature[]>(`${this.apiUrl}/${docType}s/${id}/signatures`);
    }

    /**
     * Get document type display key for translations
     */
    getDocumentTypeKey(docType: SignableDocumentType): string {
        const keys: Record<SignableDocumentType, string> = {
            decree: 'CHANCELLERY.TYPES.DECREE',
            report: 'CHANCELLERY.TYPES.REPORT',
            letter: 'CHANCELLERY.TYPES.LETTER',
            instruction: 'CHANCELLERY.TYPES.INSTRUCTION'
        };
        return keys[docType] ?? docType;
    }
}
