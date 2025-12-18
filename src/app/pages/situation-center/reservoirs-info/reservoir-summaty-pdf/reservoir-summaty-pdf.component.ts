import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { PdfViewerComponent } from '@/layout/component/pdf-viewer/pdf-viewer.component';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-reservoir-summaty-pdf',
    imports: [ReactiveFormsModule, DatePickerComponent, PdfViewerComponent],
    templateUrl: './reservoir-summaty-pdf.component.html',
    styleUrl: './reservoir-summaty-pdf.component.scss'
})
export class ReservoirSummatyPdfComponent implements OnInit {
    private fb = inject(FormBuilder);
    private reservoirService = inject(ReservoirSummaryService);

    form: FormGroup = this.fb.group({
        date: [new Date()]
    });

    pdfBlob?: Blob;
    fileName: string = 'reservoir-summary.pdf';
    isLoading = false;

    get selectedDate(): Date {
        return this.form.get('date')?.value;
    }

    get dateYMD(): string {
        return this.selectedDate ? `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}` : '';
    }

    ngOnInit() {
        this.loadPdf(this.selectedDate);

        this.form.get('date')?.valueChanges.subscribe((date) => {
            this.loadPdf(date);
        });
    }

    private loadPdf(date: Date) {
        if (date) {
            this.isLoading = true;
            this.reservoirService.downloadSummary(date, 'pdf').subscribe({
                next: (response: HttpResponse<Blob>) => {
                    this.pdfBlob = response.body!;
                    this.fileName = `СВОД_${this.dateYMD}.pdf`;
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
