import { Injectable } from '@angular/core';
import { BaseDocumentService } from './base-document.service';
import { Letter, LetterPayload, LetterFilters } from '@/core/interfaces/chancellery/letter';

/**
 * Service for managing Letters (Письма)
 * Endpoint: /letters
 */
@Injectable({
    providedIn: 'root'
})
export class LetterService extends BaseDocumentService<Letter, LetterPayload, LetterFilters> {
    protected readonly endpoint = '/letters';
}
