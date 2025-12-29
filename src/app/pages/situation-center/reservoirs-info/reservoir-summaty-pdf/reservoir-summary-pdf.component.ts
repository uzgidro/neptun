import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { PdfViewerComponent } from '@/layout/component/pdf-viewer/pdf-viewer.component';
import { HttpResponse } from '@angular/common/http';
import { DateWidget } from '@/layout/component/widget/date/date.widget';

@Component({
    selector: 'app-reservoir-summary-pdf',
    imports: [ReactiveFormsModule, PdfViewerComponent, DateWidget],
    templateUrl: './reservoir-summary-pdf.component.html',
    styleUrl: './reservoir-summary-pdf.component.scss'
})
export class ReservoirSummaryPdfComponent {
    private reservoirService = inject(ReservoirSummaryService);

    pdfBlob?: Blob;
    fileName: string = 'reservoir-summary.pdf';
    isLoading = false;

    onDateChange(event: Date) {
        this.loadPdf(event);
    }

    private loadPdf(date: Date) {
        if (date) {
            const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            this.isLoading = true;
            this.reservoirService.downloadSummary(date, 'pdf').subscribe({
                next: (response: HttpResponse<Blob>) => {
                    this.pdfBlob = response.body!;
                    this.fileName = `СВОД_${ymd}.pdf`;
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading PDF:', error);
                    this.isLoading = false;
                }
            });
        }
    }
}
