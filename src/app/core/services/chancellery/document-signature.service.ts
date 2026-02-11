import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SignableDocumentType, PendingDocument, SignDocumentRequest, SignatureResponse, RejectSignatureRequest, Signature } from '@/core/interfaces/chancellery/signature';

@Injectable({
    providedIn: 'root'
})
export class DocumentSignatureService {
    getPendingDocuments(): Observable<PendingDocument[]> {
        return of([]).pipe(delay(100));
    }

    signDocument(docType: SignableDocumentType, id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return of({ success: true } as any).pipe(delay(200));
    }

    rejectSignature(docType: SignableDocumentType, id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return of({ success: true } as any).pipe(delay(200));
    }

    getSignatures(docType: SignableDocumentType, id: number): Observable<Signature[]> {
        return of([]).pipe(delay(100));
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
