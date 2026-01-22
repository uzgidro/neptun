import { Injectable } from '@angular/core';
import { BaseDocumentService } from './base-document.service';
import { Instruction, InstructionPayload, InstructionFilters } from '@/core/interfaces/chancellery/instruction';

/**
 * Service for managing Instructions (Инструкции)
 * Endpoint: /instructions
 */
@Injectable({
    providedIn: 'root'
})
export class InstructionService extends BaseDocumentService<Instruction, InstructionPayload, InstructionFilters> {
    protected readonly endpoint = '/instructions';
}
