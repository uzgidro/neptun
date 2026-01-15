import { Injectable } from '@angular/core';
import { BaseDocumentService } from './base-document.service';
import { Decree, DecreePayload, DecreeFilters } from '@/core/interfaces/chancellery/decree';

/**
 * Service for managing Decrees (Приказы)
 * Endpoint: /decrees
 */
@Injectable({
    providedIn: 'root'
})
export class DecreeService extends BaseDocumentService<Decree, DecreePayload, DecreeFilters> {
    protected readonly endpoint = '/decrees';
}
