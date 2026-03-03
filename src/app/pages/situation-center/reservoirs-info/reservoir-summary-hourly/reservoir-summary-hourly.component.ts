import { Component, inject, OnInit } from '@angular/core';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { PdfViewerComponent } from '@/layout/component/pdf-viewer/pdf-viewer.component';
import { HttpResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-reservoir-summary-hourly',
    imports: [PdfViewerComponent, ButtonModule, TranslateModule],
    templateUrl: './reservoir-summary-hourly.component.html',
    styleUrl: './reservoir-summary-hourly.component.scss'
})
export class ReservoirSummaryHourlyComponent implements OnInit {
    private reservoirService = inject(ReservoirSummaryService);

    pdfBlob?: Blob;
    fileName: string = 'reservoir-summary-hourly.pdf';
    isLoading = false;
    isExcelLoading = false;

    ngOnInit() {
        this.loadPdf();
    }

    downloadExcel() {
        this.isExcelLoading = true;
        this.reservoirService.downloadHourlySummaryExcel().subscribe({
            next: (response: HttpResponse<Blob>) => {
                const blob = response.body!;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reservoir-summary-hourly.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
                this.isExcelLoading = false;
            },
            error: (error) => {
                console.error('Error downloading Excel:', error);
                this.isExcelLoading = false;
            }
        });
    }

    private loadPdf() {
        this.isLoading = true;
        this.reservoirService.downloadHourlySummaryPdf().subscribe({
            next: (response: HttpResponse<Blob>) => {
                this.pdfBlob = response.body!;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading PDF:', error);
                this.isLoading = false;
            }
        });
    }
}
