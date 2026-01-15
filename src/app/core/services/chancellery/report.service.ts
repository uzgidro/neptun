import { Injectable } from '@angular/core';
import { BaseDocumentService } from './base-document.service';
import { Report, ReportPayload, ReportFilters } from '@/core/interfaces/chancellery/report';

/**
 * Service for managing Reports (Рапорты)
 * Endpoint: /reports
 */
@Injectable({
    providedIn: 'root'
})
export class ReportService extends BaseDocumentService<Report, ReportPayload, ReportFilters> {
    protected readonly endpoint = '/reports';
}
