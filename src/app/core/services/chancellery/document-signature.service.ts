import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    SignableDocumentType,
    PendingDocument,
    SignDocumentRequest,
    SignatureResponse,
    RejectSignatureRequest,
    Signature
} from '@/core/interfaces/chancellery/signature';

// Мок-данные ожидающих подписи документов
const MOCK_PENDING: PendingDocument[] = [
    { id: 1, title: 'Приказ о премировании', type: 'decree', created_at: new Date().toISOString(), author: 'Петров А.С.' },
    { id: 2, title: 'Служебная записка', type: 'report', created_at: new Date().toISOString(), author: 'Иванова М.К.' }
] as PendingDocument[];

const MOCK_SIGNATURES: Signature[] = [
    { id: 1, signer_name: 'Директор', signed_at: new Date().toISOString(), status: 'signed' }
] as Signature[];

@Injectable({
    providedIn: 'root'
})
export class DocumentSignatureService {
    private http = inject(HttpClient);

    getPendingDocuments(): Observable<PendingDocument[]> {
        return of(MOCK_PENDING).pipe(delay(200));
    }

    signDocument(docType: SignableDocumentType, id: number, request: SignDocumentRequest): Observable<SignatureResponse> {
        return of({ success: true, message: 'Документ подписан' } as SignatureResponse).pipe(delay(300));
    }

    rejectSignature(docType: SignableDocumentType, id: number, request: RejectSignatureRequest): Observable<SignatureResponse> {
        return of({ success: true, message: 'Подпись отклонена' } as SignatureResponse).pipe(delay(300));
    }

    getSignatures(docType: SignableDocumentType, id: number): Observable<Signature[]> {
        return of(MOCK_SIGNATURES).pipe(delay(200));
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
