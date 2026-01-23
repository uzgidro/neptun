import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_V3 } from '@/core/services/api.service';
import {
    SignableDocumentType,
    PendingDocument,
    SignDocumentRequest,
    SignatureResponse,
    RejectSignatureRequest,
    Signature
} from '@/core/interfaces/chancellery/signature';

@Injectable({
    providedIn: 'root'
})
export class DocumentSignatureService {
    private http = inject(HttpClient);
    private readonly baseEndpoint = `${API_V3}/chancellery/signatures`;

    getPendingDocuments(): Observable<PendingDocument[]> {
        return this.http.get<PendingDocument[]>(`${this.baseEndpoint}/pending`);
    }

    signDocument(docType: SignableDocumentType, id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.baseEndpoint}/${docType}/${id}/sign`, request);
    }

    rejectSignature(docType: SignableDocumentType, id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return this.http.post<SignatureResponse>(`${this.baseEndpoint}/${docType}/${id}/reject`, request);
    }

    getSignatures(docType: SignableDocumentType, id: number): Observable<Signature[]> {
        return this.http.get<Signature[]>(`${this.baseEndpoint}/${docType}/${id}`);
    }

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
